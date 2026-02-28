import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MultiSelect } from "@/components/multiSelect";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { TimeInput } from "@/components/timeInput";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { EmployeeSelect } from "@/components/employeeSelect";
import type { AvailabilitySlot, Employee } from "@/generated/prisma/client";
import { Position } from "@/types/enums";
import { createAvailabilityAPI } from "@/lib/api/availability";

type PropsAvailabilitySlot = AvailabilitySlot & {
  employee?: Pick<Employee, "first_name" | "last_name" | "positions">;
  weeklyHrs?: number;
};

interface FormData {
  employee_id: string | null;
  name: string;
  position: Position[];
  monday: unknown[];
  tuesday: unknown[];
  wednesday: unknown[];
  thursday: unknown[];
  friday: unknown[];
  saturday: unknown[];
  sunday: unknown[];
  effectiveDate: Date;
  weeklyHrs?: number;
}

type Availability = {
  [day: string]: { enabled: boolean; start: string | null; end: string | null };
};

const defaultFormData: FormData = {
  employee_id: null,
  name: "",
  position: [Position.Prep],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
  effectiveDate: new Date(),
  weeklyHrs: 20,
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityDialog({
  isOpen,
  onChangeState,
  editingSlots,
  positionOptions,
  inputFormData,
  onSave,
}: {
  isOpen: boolean;
  onChangeState: (state: boolean) => void;
  editingSlots: PropsAvailabilitySlot[] | null;
  positionOptions: { value: Position; label: string }[];
  inputFormData: FormData | null;
  onSave: () => void;
}) {
  const [employeeSearchRes, setEmployeeSearchRes] = useState<
    Pick<Employee, "id" | "first_name" | "last_name">[]
  >([]);
  const [formData, setFormData] = useState<FormData>(
    inputFormData || defaultFormData
  );
  const [availability, setAvailability] = React.useState<Availability>({
    Monday: { enabled: false, start: null, end: null },
    Tuesday: { enabled: false, start: null, end: null },
    Wednesday: { enabled: false, start: null, end: null },
    Thursday: { enabled: false, start: null, end: null },
    Friday: { enabled: false, start: null, end: null },
    Saturday: { enabled: false, start: null, end: null },
    Sunday: { enabled: false, start: null, end: null },
  });

  async function searchEmployees(query: string) {
    if (!query) return;
    const res = await fetch(`/api/employees?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setEmployeeSearchRes(data);
  }

  const handleFormChange = (field: keyof FormData, value: unknown): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDayChange = (
    day: string,
    field: "enabled" | "start" | "end",
    newVal: boolean | string | null
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: newVal },
    }));
    if (field == "enabled" && newVal === true) {
      setAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], start: "07:00", end: "23:45" },
      }));
    }
  };

  const formatAvailabilityForAPI = (formData: FormData) => {
    const availabilitySlots: Array<AvailabilitySlot> = [];
    const dayToNumber: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7,
    };

    // Process each day
    for (const [day, timeSlots] of Object.entries(availability)) {
      if (timeSlots.enabled && timeSlots.start && timeSlots.end) {
        // Convert time strings to Date objects
        const [startHour, startMinute] = timeSlots.start.split(":").map(Number);
        const [endHour, endMinute] = timeSlots.end.split(":").map(Number);

        const startTime = new Date();
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(endHour, endMinute, 0, 0);

        const dayLower = day.toLowerCase() as keyof typeof dayToNumber;

        availabilitySlots.push({
          id: "",
          employee_id: formData.employee_id || "",
          day_of_week: dayToNumber[dayLower],
          start_time: startTime,
          end_time: endTime,
          start_date: formData.effectiveDate,
          end_date: null,
        });
      }
    }

    return availabilitySlots;
  };

  const createAvailability = async (formData: FormData) => {
    const availabilitySlots = formatAvailabilityForAPI(formData);
    createAvailabilityAPI(availabilitySlots);
    onSave();
  };

  const updateAvailability = async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`/api/availability/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          monday: formData.monday,
          tuesday: formData.tuesday,
          wednesday: formData.wednesday,
          thursday: formData.thursday,
          friday: formData.friday,
          saturday: formData.saturday,
          sunday: formData.sunday,
          daysHr: formData.weeklyHrs,
          effectiveDate: formData.effectiveDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to update employee");
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      if (editingSlots && editingSlots.length > 0) {
        // For simplicity, we delete and recreate, or we can update. 
        // Given the array nature, recreation is often safer if the number of slots changes.
        // But the user asked for "editing", so let's see if we have a bulk update API.
        // The current createAvailabilityAPI takes an array. 
        // We'll delete the old ones and create new ones for this employee/start_date combination.
        const firstSlot = editingSlots[0];
        const res = await fetch(`/api/availability/delete-group?employee_id=${firstSlot.employee_id}&start_date=${firstSlot.start_date}`, {
          method: "DELETE"
        });
        if (!res.ok) console.warn("Failed to delete old slots, proceeding anyway");

        await createAvailability(formData);
      } else {
        await createAvailability(formData);
      }
      onChangeState(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    if (editingSlots && editingSlots.length > 0) {
      const firstSlot = editingSlots[0];

      const newAvailability: Availability = {
        Monday: { enabled: false, start: null, end: null },
        Tuesday: { enabled: false, start: null, end: null },
        Wednesday: { enabled: false, start: null, end: null },
        Thursday: { enabled: false, start: null, end: null },
        Friday: { enabled: false, start: null, end: null },
        Saturday: { enabled: false, start: null, end: null },
        Sunday: { enabled: false, start: null, end: null },
      };

      const dayMap: Record<number, string> = {
        1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday", 7: "Sunday"
      };

      editingSlots.forEach(slot => {
        const dayName = dayMap[slot.day_of_week];
        if (dayName) {
          const start = new Date(slot.start_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" });
          const end = new Date(slot.end_time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "America/New_York" });
          newAvailability[dayName] = { enabled: true, start, end };
        }
      });

      setAvailability(newAvailability);
      setFormData({
        employee_id: firstSlot.employee_id,
        name: firstSlot.employee ? `${firstSlot.employee.first_name} ${firstSlot.employee.last_name}` : "",
        position: (firstSlot.employee?.positions as Position[]) || [Position.Prep],
        monday: [new Date()],
        tuesday: [new Date()],
        wednesday: [new Date()],
        thursday: [new Date()],
        friday: [new Date()],
        saturday: [new Date()],
        sunday: [new Date()],
        effectiveDate: new Date(firstSlot.start_date || new Date()),
        weeklyHrs: firstSlot.weeklyHrs || 0,
      });
    } else {
      setAvailability({
        Monday: { enabled: false, start: null, end: null },
        Tuesday: { enabled: false, start: null, end: null },
        Wednesday: { enabled: false, start: null, end: null },
        Thursday: { enabled: false, start: null, end: null },
        Friday: { enabled: false, start: null, end: null },
        Saturday: { enabled: false, start: null, end: null },
        Sunday: { enabled: false, start: null, end: null },
      });
      setFormData(inputFormData || defaultFormData);
    }
  }, [editingSlots, inputFormData]);

  return (
    <Dialog open={isOpen} onOpenChange={onChangeState}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSlots ? "Edit Availability" : "Add New Availability"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee Name</Label>
            <EmployeeSelect
              employees={employeeSearchRes}
              value={
                formData.employee_id
                  ? { id: formData.employee_id, name: formData.name }
                  : null
              }
              onSelect={(val) => {
                handleFormChange("employee_id", val?.id ?? "");
                handleFormChange("name", val?.name ?? "");
              }}
              onChange={(val) => searchEmployees(val)}
            />
          </div>

          <div className="space-y-2">
            <Label>Hrs Per Week</Label>
            <Input
              value={formData.weeklyHrs}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFormChange("weeklyHrs", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Trained Positions</Label>
            <MultiSelect
              options={positionOptions
                .filter((opt) => opt.value !== Position.All)
                .map((opt) => ({ value: opt.value, label: opt.label }))}
              onValueChange={(vals: string[]) =>
                handleFormChange("position", vals as Position[])
              }
              defaultValue={formData.position}
            />
          </div>

          <div className="space-y-2">
            <Label>Effective Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-empty={!formData.effectiveDate}
                  className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon />
                  {formData.effectiveDate ? (
                    format(formData.effectiveDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  required={false}
                  selected={formData.effectiveDate}
                  onSelect={(date: Date | undefined) =>
                    handleFormChange("effectiveDate", date || new Date())
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <Label>Daily Availability</Label>
            {days.map((day) => {
              const slot = availability[day];
              return (
                <div
                  key={day}
                  className="flex items-center justify-between gap-4 border-b pb-2"
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={slot.enabled}
                      onCheckedChange={(checked) =>
                        handleDayChange(day, "enabled", checked)
                      }
                    />
                    <Label>{day}</Label>
                  </div>

                  {slot.enabled && (
                    <div className="flex gap-2">
                      <TimeInput
                        value={slot.start}
                        onChange={(val) => handleDayChange(day, "start", val)}
                      />
                      <span>–</span>
                      <TimeInput
                        value={slot.end}
                        onChange={(val) => handleDayChange(day, "end", val)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onChangeState(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Save Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
