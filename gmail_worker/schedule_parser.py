# import streamlit as st
import camelot
import fitz
import re
from datetime import datetime, timedelta
from collections import defaultdict
import psycopg2
from psycopg2.extras import execute_values
from azure_blob_utils import read_schedule_from_blob
import os

PGHOST = os.environ["PGHOST"]
PGUSER = os.environ["PGUSER"]
PGPASSWORD = os.environ["PGPASSWORD"]
DB_CONN_STR = f"dbname=postgres user={PGUSER} host={PGHOST} password={PGPASSWORD} port=5432"
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
        raise ValueError("Start Date not found in PDF.")

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

                if time_range and "-" in time_range:
                    start, end = parse_time_range(time_range)
                    if start and end:
                        schedule[current_name].append({
                            "date": days[day],
                            "start": start,
                            "end": end,
                            "type": shift_type,
                            "hours": hours
                        })

    return schedule

def insert_schedule_to_db(schedule):
    with psycopg2.connect(DB_CONN_STR) as conn:
        with conn.cursor() as cur:
            for name, shifts in schedule.items():
                # Insert or get employee
                cur.execute("""
                    INSERT INTO employees (name)
                    VALUES (%s)
                    ON CONFLICT (name) DO NOTHING;
                """, (name,))
                conn.commit()

                cur.execute("SELECT id FROM employees WHERE name = %s;", (name,))
                employee_id = cur.fetchone()[0]

                # Prepare and insert shifts
                rows = []
                for shift in shifts:
                    rows.append((
                        employee_id,
                        shift['date'],
                        shift['start'],
                        shift['end'],
                        shift.get('type', ''),
                        shift.get('hours', '')
                    ))

                sql = """
                    INSERT INTO schedule_shifts (
                        employee_id, shift_date, start_time, end_time, shift_type, hours
                    )
                    VALUES %s
                    ON CONFLICT (employee_id, shift_date, start_time, end_time) DO NOTHING;
                """
                execute_values(cur, sql, rows)

def parse_schedule(blob_name):
    global cached_schedule
    schedule_path = read_schedule_from_blob(blob_name)
    if not schedule_path:
        raise ValueError("Failed to read schedule from blob storage.")
    else:
        start_date = extract_start_date(schedule_path)
        tables = camelot.read_pdf(schedule_path, pages="all", flavor="stream")
        cached_schedule = extract_shifts(tables, start_date)
        insert_schedule_to_db(cached_schedule)

def get_schedule_for_employee(name):
    return cached_schedule.get(name, [])
