import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  const { token, event } = await req.json()

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: token })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const createdEvent = await calendar.events.insert({
    calendarId: 'primary',
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

  return NextResponse.json({ event: createdEvent.data })
}
