import streamlit as st
import camelot
import fitz
import re
from datetime import datetime, timedelta
from collections import defaultdict
import pandas as pd
import tempfile

SCHEDULE_PATH = "latest_schedule.pdf"
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

def load_latest_schedule():
    global cached_schedule
    start_date = extract_start_date(SCHEDULE_PATH)
    tables = camelot.read_pdf(SCHEDULE_PATH, pages="all", flavor="stream")
    cached_schedule = extract_shifts(tables, start_date)

def get_schedule_for_employee(name):
    return cached_schedule.get(name, [])

# ------------------ Streamlit App ------------------

st.set_page_config(page_title="Chipotle Schedule Viewer", layout="centered")
st.title("📅 Chipotle Schedule Viewer")

uploaded_file = st.file_uploader("Upload your Chipotle schedule PDF", type="pdf")
employee_name = st.text_input("Enter your name exactly as on the schedule (e.g., Moses, Ryan)")

if uploaded_file and employee_name:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.read())
        tmp_path = tmp_file.name
    st.text("Path to temporary file: " + tmp_path)
    with st.spinner("Extracting your schedule..."):
        try:
            start_date = extract_start_date(tmp_path)
            tables = camelot.read_pdf(tmp_path, pages="all", flavor="stream")
            schedule_by_employee = extract_shifts(tables, start_date)

            shifts = schedule_by_employee.get(employee_name)
            if shifts:
                st.success(f"✅ {len(shifts)} shift(s) found for {employee_name}")
                df = pd.DataFrame(shifts)
                st.dataframe(df)
            else:
                st.warning(f"No shifts found for '{employee_name}'. Please double-check the spelling.")

        except Exception as e:
            st.error(f"Error processing PDF: {e}")
