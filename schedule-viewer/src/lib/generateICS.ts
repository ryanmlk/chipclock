import { createEvents, EventAttributes } from 'ics'

export async function generateICS(name: string, shifts: Shift[]): Promise<string> {
  const events = shifts.map((shift) => {
    const [year, month, day] = new Date(shift.shift_date).toISOString().split('T')[0].split('-').map(Number)
    const [startHour, startMinute] = shift.start_time.split(':').map(Number)
    const [endHour, endMinute] = shift.end_time.split(':').map(Number)

    // Calculate duration
    const durationHours = endHour - startHour
    const durationMinutes = 0

    return {
      start: [year, month, day, startHour, startMinute] as [number, number, number, number, number],
      duration: { hours: durationHours, minutes: durationMinutes },
      title: `${name}'s Shift`,
      description: 'Scheduled work shift',
      location: 'Chipotle',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'Chipotle Scheduler', email: 'noreply@chipotle.com'}
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
