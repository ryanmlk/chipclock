from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from gmail_worker import fetch_latest_schedule
from schedule_parser import get_schedule_for_employee
from calendar_utils import generate_ics_for_employee

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"msg": "Hello from Chipotle Scheduler"}

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    fetch_latest_schedule()
    yield
    
