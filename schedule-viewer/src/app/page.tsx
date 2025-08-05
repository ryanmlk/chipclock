'use client';
import { ScheduleTable } from '@/components/scheduleTable';
import { useEffect, useState } from 'react';

export default function SchedulePage() {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [calendarFeedUrl, setCalendarFeedUrl] = useState('');

  useEffect(() => {
    setCalendarFeedUrl(`${window.location.origin}/api/calendar/${encodeURIComponent(name)}.ics`);
  },[name])

  const fetchSchedule = async () => {
    const res = await fetch(`/api/schedule?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    setSchedule(data);
  };

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
      <button>
        <a
          href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarFeedUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Google Calendar
        </a>
      </button>
    </div>
  );
}
