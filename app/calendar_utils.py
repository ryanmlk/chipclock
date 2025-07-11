from ics import Calendar, Event
from datetime import datetime

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
