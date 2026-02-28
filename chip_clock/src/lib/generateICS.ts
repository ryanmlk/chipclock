import { createEvents, EventAttributes } from 'ics'
import type { Shift } from "@/generated/prisma/client";

export async function generateICS(name: string, shifts: Shift[]): Promise<string> {
  const events = shifts.map((shift) => {
    const startObj = [
      shift.shift_start.getFullYear(),
      shift.shift_start.getMonth() + 1,
      shift.shift_start.getDate(),
      shift.shift_start.getHours(),
      shift.shift_start.getMinutes(),
    ]
    const endObj = [
      shift.shift_end.getFullYear(),
      shift.shift_end.getMonth() + 1,
      shift.shift_end.getDate(),
      shift.shift_end.getHours(),
      shift.shift_end.getMinutes(),
    ]

    return {
      start: startObj,
      end: endObj,
      startInputType: 'local', // This prevents UTC conversion
      title: `Chipotle ${shift.position} Shift`,
      description: 'Scheduled work shift',
      location: 'Chipotle',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'Chipotle Scheduler', email: 'noreply@chipotle.com' },
    } as EventAttributes
  })

  const { error, value } = createEvents(events)
  if (error) {
    console.error('Error generating ICS:', error)
    throw new Error('Failed to generate ICS file')
  } else {
    return value || ''
  }
}
