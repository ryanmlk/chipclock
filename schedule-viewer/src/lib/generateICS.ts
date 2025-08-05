import { createEvents, EventAttributes } from 'ics'

export async function generateICS(name: string, shifts: Shift[]): Promise<string> {
  const events = shifts.map((shift) => {
    const dateObj = new Date(shift.shift_date)
    const [year, month, day] = [
      dateObj.getFullYear(),
      dateObj.getMonth() + 1,
      dateObj.getDate(),
    ]
    
    const [startHour, startMinute] = shift.start_time.split(':').map(Number)
    const [endHour, endMinute] = shift.end_time.split(':').map(Number)

    return {
      start: [year, month, day, startHour, startMinute],
      end: [year, month, day, endHour, endMinute],
      startInputType: 'local', // This prevents UTC conversion
      title: `Chipotle ${shift.shift_type} Shift`,
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
