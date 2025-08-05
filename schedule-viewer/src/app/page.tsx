'use client';
import { ScheduleTable } from '@/components/scheduleTable';
import GoogleCalendarButton from '@/components/ui/googleSignIn';
import { parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<Shift[]>([]);
  const [calendarFeedUrl, setCalendarFeedUrl] = useState('');

  const createCalendarEvents = useCallback(async () => {
    const events = schedule.map((shift) => {
        // Parse shift date
        const shiftDate = parseISO(shift.shift_date) // gives you a Date object in local time
    
        // Extract start time and end time parts
        const [startHour, startMinute] = shift.start_time.split(':').map(Number)
        const [endHour, endMinute] = shift.end_time.split(':').map(Number)
    
        // Combine date + time to create start and end Date objects
        const startDate = new Date(
          shiftDate.getFullYear(),
          shiftDate.getMonth(),
          shiftDate.getDate(),
          startHour,
          startMinute,
        )
    
        const endDate = new Date(
          shiftDate.getFullYear(),
          shiftDate.getMonth(),
          shiftDate.getDate(),
          endHour,
          endMinute
        )
    
        return {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          summary: `Chipotle ${shift.shift_type} Shift`,
          description: 'Scheduled work shift',
        }
    })
    console.log('Creating calendar events:', events)
    for (const event of events) {
        await fetch('/api/calendar/add', {
            method: 'POST',
            body: JSON.stringify({
              token: session?.accessToken,
              event: {
                summary: event.summary,
                description: event.description,
                start: event.start,
                end: event.end,
              },
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })
    }
  }, [schedule, session])

  const fetchSchedule = useCallback(async () => {
    const res = await fetch(`/api/schedule?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    setSchedule(data);
  }, [name]);

  useEffect(() => {
    const url = new URL(window.location.href)
    const shouldSync = url.searchParams.get('sync') === 'true'
    if (status === 'authenticated' && shouldSync) {
      setName(url.searchParams.get('name') || '');
      fetchSchedule().then(() => {
        url.searchParams.delete('sync')
        url.searchParams.delete('name')
        router.replace(url.pathname, { scroll: false })
      })
    }
  }, [status, router, fetchSchedule])

  useEffect(() => {
    setCalendarFeedUrl(`${window.location.origin}/api/calendar/${encodeURIComponent(name)}.ics`);
    createCalendarEvents()
  },[name, schedule, createCalendarEvents])


  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Employee Schedule</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-2 py-1 rounded mt-2 mr-2"
      />
      <button onClick={fetchSchedule} className="bg-blue-500 text-white px-3 py-1 rounded">
        View Schedule
      </button>
      <ScheduleTable shifts={schedule} />
      {(schedule.length > 0) && (<>
      <button className="bg-blue-500 text-white px-3 py-1 ml-3 rounded">
        <a
          href={`webcal://${encodeURIComponent(calendarFeedUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Apple Calendar
        </a>
      </button>
      <GoogleCalendarButton name={name} /></>)}
    </div>
  );
}
