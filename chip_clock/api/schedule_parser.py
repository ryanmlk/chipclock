import logging
import pdfplumber
import fitz
import re
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values
import os
import pytz
import tempfile
from io import BytesIO

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Output to console
    ]
)

# Database Configuration
if 'PGHOST' in os.environ:
    PGHOST = os.environ["PGHOST"]
    PGUSER = os.environ["PGUSER"]
    PGPASSWORD = os.environ["PGPASSWORD"]
    PGDATABASE = os.environ.get("PGDATABASE", "neondb")
else:
    from dotenv import load_dotenv
    load_dotenv()
    PGHOST = os.environ.get("PGHOST")
    PGUSER = os.environ.get("PGUSER")
    PGPASSWORD = os.environ.get("PGPASSWORD")
    PGDATABASE = os.environ.get("PGDATABASE", "neondb")

# Neon requires sslmode=require
DB_CONN_STR = f"dbname={PGDATABASE} user={PGUSER} host={PGHOST} password={PGPASSWORD} port=5432 sslmode=require"

# ------------------ Core Logic ------------------

def extract_start_date(pdf_path):
    doc = fitz.open(pdf_path)
    text = doc[0].get_text()
    doc.close()

    match = re.search(r"Start Date:\s*(\d{1,2}/\d{1,2}/\d{4})", text)
    if match:
        date_str = match.group(1)
        return datetime.strptime(date_str, "%m/%d/%Y")
    else:
        logging.info("Start Date not found in PDF.")
        return None

def extract_sales_projections(pdf_path, start_date=None):
    if not start_date:
        start_date = extract_start_date(pdf_path)
    if not start_date:
        return None

    days = [(start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            if "Forecasted Sales Total" in text:
                # Find the line starting with "Forecasted Sales Total"
                lines = text.splitlines() # Use splitlines() for robust splitting
                for line in lines:
                    if "Forecasted Sales Total" in line:
                        # Extract all currency values
                        amounts = re.findall(r"\$([\d,]+\.\d{2})", line)
                        
                        if len(amounts) >= 7:
                            projections = {}
                            for i in range(7):
                                # Remove '$' and ',' before converting to float
                                val_str = amounts[i].replace('$', '').replace(',', '')
                                val = float(val_str)
                                projections[days[i]] = val
                            return projections
    return None

def is_name_cell(cell):
    return bool(cell) and "," in cell and not any(char.isdigit() for char in cell)

def parse_time_range(time_range):
    if not time_range or '-' not in time_range:
        return None, None
    
    # Handle the case where hours might be in the same string separated by newline
    if "\n" in time_range:
        time_range = time_range.split("\n")[0].strip()

    try:
        start_str, end_str = time_range.strip().split('-')
    except ValueError:
        return None, None

    def normalize_time(time_str):
        time_str = time_str.strip().lower()
        if time_str.endswith('a'):
            time_str = time_str[:-1] + 'am'
        elif time_str.endswith('p'):
            time_str = time_str[:-1] + 'pm'

        # Handle cases like "8am" -> "8:00am"
        if ':' not in time_str:
            match = re.search(r'(\d+)(am|pm)', time_str)
            if match:
                time_str = f"{match.group(1)}:00{match.group(2)}"

        return time_str

    fmt = "%I:%M%p"
    try:
        start = datetime.strptime(normalize_time(start_str), fmt).strftime("%H:%M")
        end = datetime.strptime(normalize_time(end_str), fmt).strftime("%H:%M")
        return start, end
    except Exception:
        return None, None

def extract_data_from_pdf(pdf_path):
    start_date = extract_start_date(pdf_path)
    if not start_date:
        return None, None, None

    projections = extract_sales_projections(pdf_path, start_date)

    with pdfplumber.open(pdf_path) as pdf:
        # Assuming schedule is on the first page, or we iterate through all pages
        schedule = defaultdict(list)
        for page in pdf.pages:
            page_schedule = extract_shifts(page, start_date)
            for name, shifts in page_schedule.items():
                schedule[name].extend(shifts)

    return schedule, start_date, projections

def extract_shifts(page, week_start):
    days = [(week_start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    schedule = defaultdict(list)
    shift_types = {
        'P': 'Prep',
        'S': 'Salsa',
        'G': 'Grill',
        '$': 'Cashier',
        'T': 'Tortilla',
        'E': 'Expo',
        'D': 'DML',
        'L': 'MOD',
        'R': 'Training Cashier',
        'W': 'Wash',
        'Z': 'Other'
    }
    toronto_tz = pytz.timezone("America/Toronto")

    words = page.extract_words()

    # 1. Find days coordinates
    day_headers = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    day_x0 = {}
    for w in words:
        if w['text'] in day_headers:
            day_x0[w['text']] = w['x0']

    if not day_x0:
        return schedule

    sorted_days = sorted(day_x0.keys(), key=lambda d: day_x0[d])
    day_boundaries = []

    # Calculate name boundary based on first day
    name_end = day_x0[sorted_days[0]] - 25

    for i, d in enumerate(sorted_days):
        # Left boundary is the midpoint between previous day and this day, or name_end for Monday
        if i == 0:
            left = name_end
        else:
            left = (day_x0[sorted_days[i-1]] + day_x0[d]) / 2

        # Right boundary is midpoint to next day, or far right for Sunday
        if i < len(sorted_days) - 1:
            right = (day_x0[d] + day_x0[sorted_days[i+1]]) / 2
        else:
            right = day_x0[d] + 70

        day_boundaries.append((d, left, right))

    # 2. Group by row using overlapping bounding boxes
    words.sort(key=lambda w: w['top'])
    rows = []
    current_row = []
    current_bottom = -1

    for w in words:
        if not current_row:
            current_row.append(w)
            current_bottom = w['bottom']
        elif w['top'] < current_bottom:
            current_row.append(w)
            current_bottom = max(current_bottom, w['bottom'])
        else:
            rows.append(current_row)
            current_row = [w]
            current_bottom = w['bottom']

    if current_row:
        rows.append(current_row)

    # 3. Parse lines
    current_employee = None
    for row_words in rows:
        row_words.sort(key=lambda w: w['x0'])
        if not row_words: continue

        name_words = []
        for w in row_words:
            if w['x0'] < day_boundaries[0][1]:
                name_words.append(w['text'])
        name = " ".join(name_words).strip()

        # Check if the name cell actually contains a valid name (has a comma)
        if ',' in name:
            current_employee = name

        if current_employee:
            # Extract shifts for each day
            for day_idx, (day_name, left, right) in enumerate(day_boundaries):
                cell_words = [w['text'] for w in row_words if left <= w['x0'] < right]
                if cell_words:
                    # Parse shift components: Type Time-Time Hours
                    # E.g., 'T', '5:00p-8:00p', '3.00' OR 'T 5:00p-8:00p 3.00'
                    combined_cell = " ".join(cell_words)

                    # Find all time ranges in this cell
                    time_matches = re.finditer(r'([a-zA-Z\$]?)\s*(\d{1,2}:\d{2}[ap]-\d{1,2}:\d{2}[ap])\s*([\d\.]*)', combined_cell)

                    for match in time_matches:
                        shift_code = match.group(1).strip()
                        time_range = match.group(2).strip()
                        hours = match.group(3).strip()

                        start_time_str, end_time_str = parse_time_range(time_range)
                        if start_time_str and end_time_str:
                            date_str = days[day_idx]
                            try:
                                start_dt = toronto_tz.localize(
                                    datetime.strptime(f"{date_str} {start_time_str}", "%Y-%m-%d %H:%M")
                                )
                                end_dt = toronto_tz.localize(
                                    datetime.strptime(f"{date_str} {end_time_str}", "%Y-%m-%d %H:%M")
                                )

                                if end_dt < start_dt:
                                    end_dt += timedelta(days=1)

                                schedule[current_employee].append({
                                    "start": start_dt.astimezone(pytz.utc).isoformat(),
                                    "end": end_dt.astimezone(pytz.utc).isoformat(),
                                    "type": shift_types.get(shift_code, shift_code) if shift_code else "Crew",
                                    "hours": hours
                                })
                            except Exception as e:
                                logging.debug(f"Error processing shift for {name} on {date_str}: {e}")

    return schedule

def check_employee_exists(cur, conn, name):
    name_parts = name.split(',', 1)
    if len(name_parts) == 2:
        last_name = name_parts[0].strip()
        first_name = name_parts[1].strip()
    else:
        first_name = name.strip()
        last_name = ''

    cur.execute('SELECT id FROM "public"."Employee" WHERE first_name = %s AND last_name = %s;', (first_name, last_name))
    employee = cur.fetchone()

    if employee:
        return employee[0]

    cur.execute('INSERT INTO "public"."Employee" (first_name, last_name) VALUES (%s, %s) RETURNING id;', (first_name, last_name))
    res = cur.fetchone()
    if res:
        new_id = res[0]
        conn.commit()
        return new_id
    return None

def insert_schedule_to_db(schedule, start_date, projections=None):
    with psycopg2.connect(DB_CONN_STR) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM "public"."WeeklySchedule" WHERE week_start_date = %s', (start_date,))
            ws = cur.fetchone()

            if ws:
                weekly_schedule_id = ws[0]
                cur.execute('DELETE FROM "public"."Shift" WHERE schedule_id = %s', (weekly_schedule_id,))
            else:
                cur.execute('INSERT INTO "public"."WeeklySchedule" (week_start_date, published) VALUES (%s, true) RETURNING id', (start_date,))
                weekly_schedule_id = cur.fetchone()[0]

            conn.commit()
            logging.info(f"Using WeeklySchedule ID: {weekly_schedule_id} for {start_date.date()}")

            for name, shifts in schedule.items():
                employee_id = check_employee_exists(cur, conn, name)
                if not employee_id: continue

                rows = []
                for shift in shifts:
                    rows.append((
                        weekly_schedule_id,
                        employee_id,
                        shift['start'],
                        shift['end'],
                        shift.get('type', ''),
                        shift.get('hours', ''),
                    ))

                if rows:
                    sql = 'INSERT INTO "public"."Shift" (schedule_id, employee_id, shift_start, shift_end, position, hours) VALUES %s'
                    execute_values(cur, sql, rows)
            conn.commit()

            if projections:
                insert_projections_to_db(cur, conn, weekly_schedule_id, projections)

def insert_projections_to_db(cur, conn, weekly_schedule_id, projections):
    # First, delete existing sales projections for this weekly schedule
    cur.execute('DELETE FROM "public"."DailyKPI" WHERE weekly_schedule_id = %s AND kpi_name = %s', (weekly_schedule_id, 'sales_projection'))

    rows = []
    for date_str, value in projections.items():
        rows.append((
            weekly_schedule_id,
            date_str,
            value,
            'sales_projection'
        ))

    if rows:
        sql = 'INSERT INTO "public"."DailyKPI" (weekly_schedule_id, date, kpi_value, kpi_name) VALUES %s'
        execute_values(cur, sql, rows)
    conn.commit()
    logging.info(f"Inserted {len(rows)} sales projections for weekly schedule {weekly_schedule_id}")

def delete_old_shifts(week_start_date):
    """Utility to clean up old shifts if needed independently."""
    with psycopg2.connect(DB_CONN_STR) as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM "public"."WeeklySchedule" WHERE week_start_date = %s', (week_start_date,))
            ws = cur.fetchone()
            if ws:
                cur.execute('DELETE FROM "public"."Shift" WHERE schedule_id = %s', (ws[0],))
                conn.commit()

def parse_schedule(pdf_source):
    """Main entry point for parsing. Handles path or BytesIO."""
    temp_path = None
    try:
        if isinstance(pdf_source, (BytesIO, bytes)):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tf:
                if isinstance(pdf_source, BytesIO):
                    tf.write(pdf_source.getvalue())
                else:
                    tf.write(pdf_source)
                temp_path = tf.name
            pdf_path = temp_path
        else:
            pdf_path = pdf_source

        schedule, start_date, projections = extract_data_from_pdf(pdf_path)

        if schedule and start_date:
            insert_schedule_to_db(schedule, start_date, projections)
            logging.info(f"Successfully parsed and stored schedule for week starting {start_date.date()}")
            return True
        return False
    except Exception as e:
        logging.error(f"Failed to parse schedule for {pdf_path}: {e}")
        return False
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

def parse_schedule_local():
    """Process local PDF files in the schedules directory."""
    schedule_dir = '/mnt/area51/Projects/ScheduleExtractor/gmail_worker/schedules'
    if not os.path.exists(schedule_dir):
        logging.error(f"Schedules directory not found: {schedule_dir}")
        return

    files = [f for f in os.listdir(schedule_dir) if f.lower().endswith('.pdf')]
    files.sort()

    for filename in files:
        path = os.path.join(schedule_dir, filename)
        logging.info(f"Processing local file: {filename}")
        try:
            parse_schedule(path)
        except Exception as e:
            logging.error(f"Error parsing {filename}: {e}")

if __name__ == "__main__":
    parse_schedule_local()
