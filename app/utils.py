from ics import Calendar, Event
from datetime import datetime
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

PGHOST = os.getenv("PGHOST")
PGUSER = os.getenv("PGUSER")
PGPASSWORD = os.getenv("PGPASSWORD")
DB_CONN_STR = f"dbname=postgres user={PGUSER} host={PGHOST} password={PGPASSWORD} port=5432"

def generate_ics_for_employee(name, shifts):
    cal = Calendar()
    for shift in shifts:
        event = Event()
        event.name = f"Chipotle Shift ({shift['type']})"
        event.begin = f"{shift['date']} {shift['start']}"
        event.end = f"{shift['date']} {shift['end']}"
        event.description = f"{name} | {shift['hours']} hrs"
        cal.events.add(event)
    return str(cal)

def get_employee_shifts(name: str):
    conn = psycopg2.connect(DB_CONN_STR)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT e.name, s.shift_date, s.start_time, s.end_time, s.shift_type, s.hours
            FROM schedule_shifts s
            JOIN employees e ON s.employee_id = e.id
            WHERE e.name ILIKE %s
              AND s.shift_date >= CURRENT_DATE
              AND s.shift_date < CURRENT_DATE + INTERVAL '7 days'
            ORDER BY s.shift_date, s.start_time;
        """, (f"%{name}%",))
        results = cur.fetchall()

    return [
        {
            "employee": r[0],
            "date": r[1],
            "start": str(r[2]),
            "end": str(r[3]),
            "type": r[4],
            "hours": r[5]
        } for r in results
    ]
