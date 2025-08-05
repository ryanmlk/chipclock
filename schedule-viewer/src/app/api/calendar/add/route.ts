import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  const { token, event } = await req.json()

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: token })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  const calendarList = await calendar.calendarList.list()
  let chipotleCalendar = calendarList.data.items?.find(
    (cal) => cal.summary === 'Chipotle Schedule'
  )

  if (!chipotleCalendar) {
    const newCal = await calendar.calendars.insert({
      requestBody: {
        summary: 'Chipotle Schedule',
        timeZone: 'America/Toronto',
      },
    })
  
    chipotleCalendar = newCal.data
  }

  const existingEvents = await calendar.events.list({
    calendarId: chipotleCalendar.id!,
    timeMin: event.start, // ISO string
    timeMax: event.end,
    q: event.summary, // simple keyword match
  })

  let createdEvent = null;
  
  if(!existingEvents.data.items || existingEvents.data.items.length < 1) {
    createdEvent = await calendar.events.insert({
      calendarId: chipotleCalendar.id!,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start,
          timeZone: 'America/Toronto',
        },
        end: {
          dateTime: event.end,
          timeZone: 'America/Toronto',
        },
      },
    })
  }


  return NextResponse.json({ event: createdEvent?.data || null })
}
