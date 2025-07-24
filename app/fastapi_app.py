from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from utils import generate_ics_for_employee, get_employee_shifts

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

@app.get("/api/calendar/{name}.ics")
def get_calendar_feed(name: str):
    schedule = get_employee_shifts(name)
    if not schedule:
        raise HTTPException(status_code=404, detail="No shifts found")
    ics_content = generate_ics_for_employee(name, schedule)
    return Response(content=ics_content, media_type="text/calendar")

@app.get("/api/shifts")
def get_shifts(name: str):
    shifts = get_employee_shifts(name)
    if not shifts:
        return {"msg": "No shifts found"}
    return shifts


    
