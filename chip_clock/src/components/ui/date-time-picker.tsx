"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  value: Date
  onChange: (date: Date) => void
  disabled?: boolean
}

export function DateTimePicker({ value, onChange, disabled = false }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(value.getHours())
      newDate.setMinutes(value.getMinutes())
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)

      const now = new Date()
      if (newDate < now) {
        onChange(now)
      } else {
        onChange(newDate)
      }
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hours' | 'minutes') => {
    const val = parseInt(e.target.value)
    if (isNaN(val)) return

    const newDate = new Date(value)
    if (type === 'hours') {
      newDate.setHours(val)
    } else {
      newDate.setMinutes(val)
    }
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)

    const now = new Date()
    // For time changes today, doing < now checks exact minutes and might block valid typing during transition,
    // but the requirement is "only allow future dates and times" so auto-correcting to now is safe.
    if (newDate < now) {
       onChange(now)
    } else {
       onChange(newDate)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-[260px] justify-start text-left font-normal text-black dark:text-white",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP HH:mm") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          fromDate={new Date()}
          initialFocus
        />
        <div className="p-3 border-t">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-sm font-medium mr-2">Time:</span>
            <div className="relative">
                <Input 
                   type="number" 
                   min={0} 
                   max={23}
                   value={value.getHours().toString().padStart(2, '0')}
                   onChange={(e) => handleTimeChange(e, 'hours')}
                   className="w-[60px] h-8 text-center px-1"
                   aria-label="Hours"
                />
            </div>
            <span className="text-sm text-muted-foreground">:</span>
            <div className="relative">
                <Input 
                   type="number" 
                   min={0} 
                   max={59}
                   value={value.getMinutes().toString().padStart(2, '0')}
                   onChange={(e) => handleTimeChange(e, 'minutes')}
                   className="w-[60px] h-8 text-center px-1"
                   aria-label="Minutes"
                />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
