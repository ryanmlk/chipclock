"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Props = {
  shifts: Shift[]
}

export function ScheduleTable({ shifts }: Props) {
  const sortedShifts = [...shifts].sort((a, b) => a.shift_date.localeCompare(b.shift_date))

const formatShiftDate = (date: string): string => {
    console.log('Formatting date:', date);
    const d = new Date(date);
    
    // Get day of week
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get month
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    
    // Get day with ordinal suffix
    const day = d.getDate();
    const suffix = getDaySuffix(day);
    
    return `${dayOfWeek}, ${month} ${day}${suffix}`;
}

const getDaySuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

const getShiftType = (type: string): string => {
    switch (type) {
        case 'P': return 'Prep';
        case 'S': return 'Salsa';
        case 'G': return 'Grill';
        case '$': return 'Cashier';
        case 'T': return 'Tortilla';
        case 'E': return 'Expo';
        case 'D': return 'DML';
        default: return type;    }
}

const formatTime = (time: string): string => {
    console.log('Formatting time:', time);
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
            <TableCell>{formatShiftDate(shift.shift_date)}</TableCell>
            <TableCell>{formatTime(shift.start_time)}</TableCell>
            <TableCell>{formatTime(shift.end_time)}</TableCell>
            <TableCell>{getShiftType(shift.shift_type)}</TableCell>
            <TableCell>{shift.hours}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
