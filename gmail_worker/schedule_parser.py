# import streamlit as st
import logging
import camelot
import fitz
import re
from datetime import datetime, timedelta
from collections import defaultdict
import psycopg2
from psycopg2.extras import execute_values
from azure_blob_utils import read_schedule_from_blob
import os
import pytz
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Output to console
    ]
)

# Check if running in Azure Functions environment
is_azure_function = 'AZURE_FUNCTIONS_ENVIRONMENT' in os.environ

if is_azure_function:
    PGHOST = os.environ["PGHOST"]
    PGUSER = os.environ["PGUSER"]
    PGPASSWORD = os.environ["PGPASSWORD"]
    PGDATABASE = os.environ["PGDATABASE"]
    logging.info("Running in Azure Functions environment")
else:
    # Local environment - load from .env file
    from dotenv import load_dotenv
    load_dotenv()
    
    PGHOST = os.environ.get("PGHOST")
    PGUSER = os.environ.get("PGUSER")
    PGPASSWORD = os.environ.get("PGPASSWORD")
    PGDATABASE = os.environ.get("PGDATABASE")
    
    logging.info("Running in local environment")

DB_CONN_STR = f"dbname={PGDATABASE} user={PGUSER} host={PGHOST} password={PGPASSWORD} port=5432"
cached_schedule = {}

# ------------------ Core Logic (from your script) ------------------

def extract_start_date(pdf_path):
    doc = fitz.open(pdf_path)
    text = doc[0].get_text()

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
    start_str, end_str = time_range.strip().split('-')

    def normalize_time(time_str):
        time_str = time_str.strip()
        if time_str.endswith('a'):
            return time_str[:-1] + 'AM'
        elif time_str.endswith('p'):
            return time_str[:-1] + 'PM'
        return time_str.upper()

    fmt = "%I:%M%p"
    try:
        start = datetime.strptime(normalize_time(start_str), fmt).strftime("%H:%M")
        end = datetime.strptime(normalize_time(end_str), fmt).strftime("%H:%M")
        return start, end
    except ValueError:
        return None, None

def extract_shifts(tables, week_start):
    days = [(week_start + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    schedule = defaultdict(list)
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
            
            for day in range(7):
                if table.shape[1] < 20:
                    i = 1 + day * 2
                    time_parts = str(row[i + 1]).strip().split("\n") if i + 1 < len(row) else ["", ""]
                    time_range = time_parts[0]
                    hours = time_parts[1] if len(time_parts) > 1 else ""
                else:
                    i = 1 + day * 3
                    time_range = str(row[i + 1]).strip() if i + 1 < len(row) else ""
                    hours = str(row[i + 2]).strip() if i + 2 < len(row) else ""

                shift_type = str(row[i]).strip() if i < len(row) else ""
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

                if time_range and "-" in time_range:
                    start_time_str, end_time_str = parse_time_range(time_range)
                    if start_time_str and end_time_str:
                        date_str = days[day]
                        toronto_tz = pytz.timezone("America/Toronto")
                        
                        start_dt = toronto_tz.localize(
                            datetime.strptime(f"{date_str} {start_time_str}", "%Y-%m-%d %H:%M")
                        )
                        end_dt = toronto_tz.localize(
                            datetime.strptime(f"{date_str} {end_time_str}", "%Y-%m-%d %H:%M")
                        )

                        schedule[current_name].append({
                            "start": start_dt.astimezone(pytz.utc).isoformat(),
                            "end": end_dt.astimezone(pytz.utc).isoformat(),
                            "type": shift_types.get(shift_type, shift_type),
                            "hours": hours
                        })

    return schedule

def check_employee_exists(cur, conn, name):
    # Split name into first and last name
    name_parts = name.split(',', 1)
    if len(name_parts) == 2:
        last_name = name_parts[0].strip()
        first_name = name_parts[1].strip()
    else:
        # If can't split, put everything in first_name
        first_name = name.strip()
        last_name = ''
    
    # Insert or get employee
    cur.execute("""
                SELECT id FROM "public"."Employee" WHERE first_name = %s AND last_name = %s;
            """, (first_name, last_name))

    employee = cur.fetchone()
            
    if employee:
        # Use the existing employee ID
        employee_id = employee[0]
    else:
        # Insert new employee
        cur.execute("""
            INSERT INTO "public"."Employee" (first_name, last_name)
            VALUES (%s, %s)
            RETURNING id;
        """, (first_name, last_name))
        employee_insert_result = cur.fetchone()
        if employee_insert_result is None:
            logging.error(f"Failed to create employee: {first_name} {last_name}")
        conn.commit()
        employee_id = employee_insert_result[0]

    return employee_id

def insert_schedule_to_db(schedule, start_date):
    with psycopg2.connect(DB_CONN_STR) as conn:
        with conn.cursor() as cur:
            # Insert or get the weekly schedule record
            # First check if a weekly schedule with this date already exists
            cur.execute("""
                SELECT id FROM "public"."WeeklySchedule" 
                WHERE week_start_date = %s
            """, (start_date,))
            
            existing_schedule = cur.fetchone()
            
            if existing_schedule:
                # Use the existing schedule ID
                weekly_schedule_id = existing_schedule[0]
            else:
                # Insert new weekly schedule
                cur.execute("""
                    INSERT INTO "public"."WeeklySchedule" (week_start_date)
                    VALUES (%s)
                    RETURNING id;
                """, (start_date,))
                # Get the returned ID
                schedule_insert_result = cur.fetchone()
                if schedule_insert_result is None:
                    logging.error(f"Failed to create weekly schedule for date: {start_date}")
                conn.commit()
                weekly_schedule_id = schedule_insert_result[0]
            
            logging.info(f"Weekly schedule ID: {weekly_schedule_id} for week starting {start_date}")
            for name, shifts in schedule.items():
                # Ensure employee exists
                employee_id = check_employee_exists(cur, conn, name)
                # Prepare and insert shifts
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

                sql = """
                    INSERT INTO "public"."Shift" (
                        schedule_id, employee_id, shift_start, shift_end, position, hours
                    )
                    VALUES %s;
                """
                execute_values(cur, sql, rows)
                
def delete_old_shifts(week_start_date):
    with psycopg2.connect(DB_CONN_STR) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.schedule_id FROM "public"."Shift" s
                WHERE s.schedule_id = (
                    SELECT id FROM "public"."WeeklySchedule"
                    WHERE week_start_date = %s
                )
            """, (week_start_date,))
            results = cur.fetchall()
            if results:
                cur.execute("""DELETE FROM "public"."Shift" WHERE schedule_id = %s;""", (results[0][0],))
                conn.commit()
                logging.info(f"Deleted {cur.rowcount} old shifts for week starting {week_start_date}.")
            else:
                logging.info(f"No existing shifts found for week starting {week_start_date}.")
    

def parse_schedule(blob_name):
    global cached_schedule
    schedule_path = read_schedule_from_blob(blob_name)
    if not schedule_path:
        raise ValueError("Failed to read schedule from blob storage.")
    else:
        start_date = extract_start_date(schedule_path)
        tables = camelot.read_pdf(schedule_path, pages="all", flavor="stream")
        cached_schedule = extract_shifts(tables, start_date)
        delete_old_shifts(start_date)
        insert_schedule_to_db(cached_schedule, start_date)
        
def parse_schedule_local():
    # Get the count of schedule files in the directory
    schedule_dir = '/mnt/area51/Projects/ScheduleExtractor/gmail_worker/schedules'
    
    # Check if directory exists
    if not os.path.exists(schedule_dir):
        logging.error(f"Schedules directory not found: {schedule_dir}")
        count = 0
    else:
        # List all schedule files with pattern schedule_X.pdf
        schedule_files = [f for f in os.listdir(schedule_dir) if re.match(r'schedule_\d+\.pdf', f)]
        count = len(schedule_files) - 1
            
    logging.info(f"Found {count} schedule files to process")
    while count >= 0:
        logging.info(f"Attempting to parse local schedule file: schedule_{count}.pdf")
        schedule_path = f'{schedule_dir}/schedule_{count}.pdf'
        if not os.path.exists(schedule_path):
            logging.error(f"File not found: {schedule_path}")
        else:
            start_date = extract_start_date(schedule_path)
            print(start_date)
            if not start_date:
                logging.error(f"Failed to extract start date from {schedule_path}")
                count -= 1
                continue
            tables = camelot.read_pdf(schedule_path, pages="all", flavor="stream")
            cached_schedule = extract_shifts(tables, start_date)
            delete_old_shifts(start_date)
            insert_schedule_to_db(cached_schedule, start_date)
        logging.info(f"Schedule No. {count} parsed successfully with start date {start_date.strftime('%Y-%m-%d')}.\n===================================")
        count -= 1

def get_schedule_for_employee(name):
    return cached_schedule.get(name, [])
