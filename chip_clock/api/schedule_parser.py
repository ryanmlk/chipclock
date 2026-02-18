import logging
import camelot
import fitz
import re
from datetime import datetime, timedelta
from collections import defaultdict
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

def extract_shifts(tables, week_start):
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

    for table in tables:
        current_name = None
        df = table.df
        if df.empty:
            continue
            
        for _, row in df.iterrows():
            raw_name = str(row[0]).strip()

            if raw_name == "Forecast Sales and Staffing Detail":
                break

            if is_name_cell(raw_name):
                current_name = raw_name

            if not current_name:
                continue
            
            # Determine step (2 or 3) based on row length
            step = 2 if table.shape[1] < 20 else 3
            
            for day in range(7):
                col_i = 1 + day * step
                if col_i + (step - 1) >= table.shape[1]:
                    continue

                shift_type_code = str(row[col_i]).strip()
                time_cell = str(row[col_i + 1]).strip()
                
                time_range = time_cell
                hours = ""
                
                if step == 2 and "\n" in time_cell:
                    parts = time_cell.split("\n")
                    time_range = parts[0].strip()
                    hours = parts[1].strip() if len(parts) > 1 else ""
                elif step == 3:
                    hours = str(row[col_i + 2]).strip()

                if time_range and "-" in time_range:
                    start_time_str, end_time_str = parse_time_range(time_range)
                    if start_time_str and end_time_str:
                        date_str = days[day]
                        
                        try:
                            start_dt = toronto_tz.localize(
                                datetime.strptime(f"{date_str} {start_time_str}", "%Y-%m-%d %H:%M")
                            )
                            end_dt = toronto_tz.localize(
                                datetime.strptime(f"{date_str} {end_time_str}", "%Y-%m-%d %H:%M")
                            )

                            if end_dt < start_dt:
                                end_dt += timedelta(days=1)

                            schedule[current_name].append({
                                "start": start_dt.astimezone(pytz.utc).isoformat(),
                                "end": end_dt.astimezone(pytz.utc).isoformat(),
                                "type": shift_types.get(shift_type_code, shift_type_code) if shift_type_code else "Crew",
                                "hours": hours
                            })
                        except Exception as e:
                            logging.debug(f"Error processing shift for {current_name} on {date_str}: {e}")

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

def insert_schedule_to_db(schedule, start_date):
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

        start_date = extract_start_date(pdf_path)
        if not start_date:
            return False

        tables = camelot.read_pdf(pdf_path, pages="all", flavor="stream")
        schedule = extract_shifts(tables, start_date)
        
        if schedule:
            insert_schedule_to_db(schedule, start_date)
            logging.info(f"Successfully parsed and stored schedule for week starting {start_date.date()}")
            return True
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

    files = [f for f in os.listdir(schedule_dir) if re.match(r'schedule_\d+\.pdf', f)]
    files.sort(key=lambda x: int(re.search(r'\d+', x).group()))
    
    for filename in files:
        path = os.path.join(schedule_dir, filename)
        logging.info(f"Processing local file: {filename}")
        try:
            parse_schedule(path)
        except Exception as e:
            logging.error(f"Error parsing {filename}: {e}")

if __name__ == "__main__":
    parse_schedule_local()
