'use client';
import { useState } from 'react';

export default function SchedulePage() {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState([]);

  const fetchSchedule = async () => {
    const res = await fetch(`/api/schedule?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    setSchedule(data);
    console.log(data);
  };

  type shift = {
    name: string;
    start_time: string;
    end_time: string;
    shift_date: string;
    shift_type: string;
    hours: string;
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

      <ul className="mt-4">
        {schedule.map((shift: shift, index) => (
          <li key={index} className="border-b py-1">
            {shift.shift_date}: {shift.start_time} - {shift.end_time} ({shift.shift_type})
          </li>
        ))}
      </ul>
    </div>
  );
}
