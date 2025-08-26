"use client";
import { ScheduleTable } from "@/components/scheduleTable";
import GoogleCalendarButton from "@/components/ui/googleSignIn";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { WeeklyHoursCard } from "@/components/weeklyHoursCard";

export default function SchedulePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState<Shift[]>([]);
  const [calendarFeedUrl, setCalendarFeedUrl] = useState("");

  const fetchSchedule = useCallback(async (nameParam?: string) => {
    const nameToUse = nameParam || name;
    if (!nameToUse) {
      toast("Please enter your name", {
        description: "Name is required to fetch your schedule.",
      });
      return;
    }
    
    const res = await fetch(`/api/schedule?name=${encodeURIComponent(nameToUse)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 1) {
      console.error("Failed to fetch schedule:", data);
      toast("Failed to fetch schedule", {
        description: "Check that name matches name in Schedule and try again.",
      });
      return;
    }
    const parsedData = data.map(shift => ({
      ...shift,
      shift_start: new Date(shift.shift_start),
      shift_end: new Date(shift.shift_end),
    }));
    
    localStorage.setItem("scheduleName", nameToUse);
    if (nameParam && nameParam !== name) {
      setName(nameToUse);
    }
    setSchedule(parsedData);
  }, [name]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const shouldSync = url.searchParams.get("sync") === "true";
    if (shouldSync) {
      const name = url.searchParams.get("name") || "";
      const syncUrl = name ? `/sync?name=${encodeURIComponent(name)}` : "/sync";
      router.replace(syncUrl);
    }
  }, [router]);

  useEffect(() => {
    setCalendarFeedUrl(
      `${window.location.origin}/api/calendar/${encodeURIComponent(name)}.ics`
    );
  }, [name]);

  useEffect(() => {
    const storedName = localStorage.getItem("scheduleName");
    if (storedName) {
      setName(storedName);
      fetchSchedule(storedName);
    }
  }, []);
  

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Chipotle Schedule</h1>
        <button 
          onClick={() => router.push('/availability')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Manage Availability
        </button>
      </div>
      <Card>
        <CardContent>
        <CardAction className="flex flex-col items-center gap-2 w-full">
              <input
                type="text"
                placeholder="Enter your name (E.g. John)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border px-2 py-1 rounded mt-2 flex-grow w-full"
              />
              <button
                onClick={() => fetchSchedule()}
                className="bg-blue-500 text-white px-3 py-1 rounded mt-2 mb-5 w-full"
              >
                View Schedule
              </button>
          </CardAction>
          {schedule.length > 0 && <ScheduleTable shifts={schedule} />}
        </CardContent>
      </Card>
      {schedule.length > 0 && <WeeklyHoursCard name={name} />}
      {/* {(schedule.length > 0) && (<>
      <button className="bg-blue-500 text-white px-3 py-1 ml-3 rounded">
        <a
          href={`webcal://${encodeURIComponent(calendarFeedUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Apple Calendar
        </a>
      </button>
      <GoogleCalendarButton name={name} /></>)} */}
    </div>
  );
}
