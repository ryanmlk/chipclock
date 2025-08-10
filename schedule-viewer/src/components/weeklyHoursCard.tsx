"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

const data = [
  { value: 10 },
  { value: 40 },
  { value: 20 },
  { value: 80 },
  { value: 30 },
];

type Props = {
  name: string;
};

type WeeklyHours = {
  week_start_date: string;
  total_hours: number;
};

export function WeeklyHoursCard({ name }: Props) {
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours[]>([]);
  const [hoursChanged, setHoursChanged] = useState(0);
  const [hoursChangedPercent, setHoursChangedPercent] = useState(0);

  const fetchWeeklyHours = useCallback(async () => {
    const res = await fetch(`/api/hours?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length < 1) {
      console.error("Failed to weekly hours:", data);
      toast("Failed to fetch schedule", {
        description: "Check that name matches name in Schedule and try again.",
      });
      return;
    }
    setWeeklyHours(data);
  }, [name]);

  const calculateHoursChanged = useCallback(() => {
    if (weeklyHours.length > 2) {
      const currentWeekHours = weeklyHours[0].total_hours;
      const lastWeekHours = weeklyHours[1].total_hours;
      setHoursChanged(currentWeekHours - lastWeekHours);
    const percentChange = lastWeekHours !== 0 
      ? ((currentWeekHours - lastWeekHours) / Math.abs(lastWeekHours)) * 100
      : 0;
    setHoursChangedPercent(percentChange);
    }
  }, [weeklyHours]);

  useEffect(() => {
    if (!name) return;
    fetchWeeklyHours();
  }, [fetchWeeklyHours, name]);

  useEffect(() => {
    calculateHoursChanged();
  }, [calculateHoursChanged]);

  return (
    <Card className="mt-5 text-white border-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm text-gray-400">Weekly Hours</CardTitle>
          <p className="text-2xl font-bold">{hoursChangedPercent > 0 && '+'}{hoursChanged} Hours</p>
          {hoursChangedPercent > 0 ? (
            <p className="text-green-400 text-sm">
              Up {hoursChangedPercent.toFixed()}% from last week
            </p>
          ) : (
            <p className="text-red-400 text-sm">
              Down {hoursChangedPercent.toFixed()}% from last week
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="h-60 p-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weeklyHours}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <YAxis />
            <Line
              type="monotone"
              dataKey="total_hours"
              stroke="#fff"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
