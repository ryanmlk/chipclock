"use client";
import { ScheduleTable } from "@/components/scheduleTable";
import GoogleCalendarButton from "@/components/ui/googleSignIn";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Shift } from "@/generated/prisma/client";

export default function DeploymentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState<Shift[]>([]);


  const fetchSchedule = useCallback(
    async (nameParam?: string) => {
      const nameToUse = nameParam || name;
      if (!nameToUse) {
        toast("Please enter your name", {
          description: "Name is required to fetch your deployment.",
        });
        return;
      }

      const res = await fetch(
        `/api/schedule?name=${encodeURIComponent(nameToUse)}`
      );
      const data = await res.json();
      if (!Array.isArray(data) || data.length < 1) {
        console.error("Failed to fetch deployment:", data);
        toast("Failed to fetch deployment", {
          description:
            "Check that name matches name in Deployment and try again.",
        });
        return;
      }
      const parsedData = data.map((shift) => ({
        ...shift,
        shift_start: new Date(shift.shift_start),
        shift_end: new Date(shift.shift_end),
      }));

      localStorage.setItem("scheduleName", nameToUse);
      if (nameParam && nameParam !== name) {
        setName(nameToUse);
      }
      setSchedule(parsedData);
    },
    [name]
  );

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
    const storedName = localStorage.getItem("scheduleName");
    if (storedName) {
      setName(storedName);
      fetchSchedule(storedName);
    }
  }, [fetchSchedule]);

  return (
    <div className="p-4">
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
              View Deployment
            </button>
          </CardAction>
          {schedule.length > 0 && <ScheduleTable shifts={schedule} />}
        </CardContent>
      </Card>
      {/* {schedule.length > 0 && <WeeklyHoursCard name={name} />} */}
      <GoogleCalendarButton name={name} />
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


