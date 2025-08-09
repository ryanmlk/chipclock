"use client";
import { ScheduleTable } from "@/components/scheduleTable";
import GoogleCalendarButton from "@/components/ui/googleSignIn";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function SchedulePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState<Shift[]>([]);
  const [calendarFeedUrl, setCalendarFeedUrl] = useState("");

  const fetchSchedule = useCallback(async () => {
    const res = await fetch(`/api/schedule?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 1) {
      console.error("Failed to fetch schedule:", data);
      toast("Failed to fetch schedule", {
        description: "Check that name matches name in Schedule and try again.",
      })
      return;
    }
    setSchedule(data);
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-center mb-4">Chipotle Schedule</h1>
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
                onClick={fetchSchedule}
                className="bg-blue-500 text-white px-3 py-1 rounded mt-2 mb-5 w-full"
              >
                View Schedule
              </button>
          </CardAction>
          <ScheduleTable shifts={schedule} />
        </CardContent>
      </Card>
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
