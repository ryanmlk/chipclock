from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from app.schedule_parser import get_schedule_for_employee, load_latest_schedule
from app.calendar_utils import generate_ics_for_employee

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/shifts/{name}")
def get_shifts(name: str):
    schedule = get_schedule_for_employee(name)
    if not schedule:
        raise HTTPException(status_code=404, detail="No shifts found for this employee")
    return schedule

@app.get("/calendar/{name}.ics")
def get_calendar_feed(name: str):
    schedule = get_schedule_for_employee(name)
    if not schedule:
        raise HTTPException(status_code=404, detail="No shifts found")
    ics_content = generate_ics_for_employee(name, schedule)
    return Response(content=ics_content, media_type="text/calendar")

@app.on_event("startup")
def load_data():
    load_latest_schedule()  # Loads latest PDF if needed
