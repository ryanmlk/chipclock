import { format } from "date-fns";

function combineDateAndTime(dateString: string, timeString: string): Date {
    const date = new Date(dateString);
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds || 0);
    return date;
  }

export function generateICS(name: string, shifts: Shift[]) {
  const events = shifts.map((shift, i) => {
    const startDate = combineDateAndTime(shift.shift_date, shift.start_time);
    const endDate = combineDateAndTime(shift.shift_date, shift.end_time);
    const start = format(startDate, "yyyyMMdd'T'HHmmss");
    const end = format(endDate, "yyyyMMdd'T'HHmmss");

    return `
BEGIN:VEVENT
UID:${name}-shift-${i}@schedule.app
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:Shift
DESCRIPTION:Work shift for ${name}
END:VEVENT`;
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.join("\n")}
END:VCALENDAR`;
}
