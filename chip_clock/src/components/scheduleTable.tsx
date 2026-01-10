"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shift } from "@/generated/prisma";
import { format } from 'date-fns';

type Props = {
  shifts: Shift[]
}

export function ScheduleTable({ shifts }: Props) {
  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.shift_start).getTime() - new Date(b.shift_start).getTime()
  );

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedShifts.map((shift, index) => (
          <TableRow key={index}>
            <TableCell>{format(shift.shift_start, "EEEE, MMMM do yyyy")}</TableCell>
            <TableCell>{formatTime(shift.shift_start)}</TableCell>
            <TableCell>{formatTime(shift.shift_end)}</TableCell>
            <TableCell>{shift.position}</TableCell>
            <TableCell>{shift.hours}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
