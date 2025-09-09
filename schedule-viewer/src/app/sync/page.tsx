"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export default function SyncPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasRun = useRef(false);

  const fetchSchedule = useCallback(async (name: string): Promise<Shift[]> => {
    const res = await fetch(`/api/schedule?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 1) {
      console.error("Failed to fetch schedule:", data);
      return [];
    }
    const parsedData = data.map(shift => ({
      ...shift,
      shift_start: new Date(shift.shift_start),
      shift_end: new Date(shift.shift_end),
    }));
    return parsedData;
  }, []);

  const createCalendarEvents = useCallback(async (data: Shift[]) => {
    const events = data.map((shift: Shift) => {
      return {
        id: shift.id,
        start: shift.shift_start.toISOString(),
        end: shift.shift_end.toISOString(),
        summary: `Chipotle ${shift.shift_type} Shift`,
        description: "Scheduled work shift",
      };
    });
    await fetch("/api/calendar/add", {
      method: "POST",
      body: JSON.stringify({
        token: session?.accessToken,
        events: events,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, [session]);

  useEffect(() => {
    async function syncSchedule() {
      if (hasRun.current) return;
      if (status !== "authenticated") return;

      hasRun.current = true;
      const url = new URL(window.location.href);
      console.log("Authenticated, fetching schedule...");

      const name = url.searchParams.get("name") || "";
      fetchSchedule(name).then((data: Shift[]) => {
        console.log("Schedule fetched", data);
        createCalendarEvents(data).then(() => router.replace('/'))
      });
    }

    syncSchedule();
  }, [status, router, fetchSchedule, createCalendarEvents]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Syncing Your Schedule</h1>
      <p className="text-lg mb-6">Please wait until redirected to homepage</p>
    </div>
  );
}
