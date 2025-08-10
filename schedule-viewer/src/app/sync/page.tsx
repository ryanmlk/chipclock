"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function SyncPage() {
  const { data: session, status } = useSession();
  const [schedule, setSchedule] = useState<Shift[]>([]);
  const router = useRouter();
  const hasRun = useRef(false);

  const fetchSchedule = useCallback(async (name: string) => {
    const res = await fetch(`/api/schedule?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    setSchedule(data);
    return data;
  }, []);

  const createCalendarEvents = useCallback(async () => {
    const events = schedule.map((shift: Shift) => {
      return {
        id: shift.id,
        start: shift.shift_start.toISOString(),
        end: shift.shift_end.toISOString(),
        summary: `Chipotle ${shift.shift_type} Shift`,
        description: "Scheduled work shift",
      };
    });
    const promises = events.map((event) => {
      fetch("/api/calendar/add", {
        method: "POST",
        body: JSON.stringify({
          token: session?.accessToken,
          event: {
            id: event.id,
            summary: event.summary,
            description: event.description,
            start: event.start,
            end: event.end,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    await Promise.all(promises);
  }, [schedule, session]);

  useEffect(() => {
    async function syncSchedule() {
      if (hasRun.current) return;
      if (status !== "authenticated") return;

      hasRun.current = true;
      const url = new URL(window.location.href);
      console.log("Authenticated, fetching schedule...");

      const name = url.searchParams.get("name") || "";
      await fetchSchedule(name);
      console.log("Schedule fetched", schedule);
      await createCalendarEvents();
      router.replace('/');
    }

    syncSchedule();
  }, [status, router, fetchSchedule, createCalendarEvents, schedule]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Syncing Your Schedule</h1>
      <p className="text-lg mb-6">Please wait until redirected to homepage</p>
    </div>
  );
}
