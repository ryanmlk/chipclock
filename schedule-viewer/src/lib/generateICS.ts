import { format } from "date-fns";

export function generateICS(name: string, shifts: Shift[]) {
  const events = shifts.map((shift, i) => {
    const start = format(new Date(`${shift.shift_date}T${shift.start_time}`), "yyyyMMdd'T'HHmmss");
    const end = format(new Date(`${shift.shift_date}T${shift.end_time}`), "yyyyMMdd'T'HHmmss");

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
