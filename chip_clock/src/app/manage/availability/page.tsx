"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Download, Printer } from "lucide-react";
import { Position } from "@/types/enums";
import type { AvailabilitySlot, Employee } from "@/generated/prisma/client";
import AvailabilityDialog from "@/components/availabilityDialog";
import { fetchAvailabilitiesAPI } from "@/lib/api/availability";



interface PositionOptions {
  value: Position;
  label: string;
  style?: { badgeColor: string };
}

interface FormattedAvailability {
  [key: string]: (AvailabilitySlot & {
    employee?: Pick<Employee, "id" | "first_name" | "last_name" | "positions">;
  })[];
}

const ChipotleAvailabilityTracker: React.FC = () => {
  const [filteredAvailability, setFilteredAvailabilities] =
    useState<FormattedAvailability>({});
  const [positionFilter, setPositionFilter] = useState<Position>(Position.All);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSlots, setEditingSlots] = useState<AvailabilitySlot[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getJobTypeColor = (jobType: Position): string => {
    const colors: Record<Position, string> = {
      [Position.All]: "bg-gray-500",
      [Position.Grill]: "bg-amber-700",
      [Position.Tortilla]: "bg-orange-600",
      [Position.Line]: "bg-red-500",
      [Position.Prep]: "bg-green-500",
      [Position.Cash]: "bg-blue-500",
      [Position.Salsa]: "bg-pink-500",
      [Position.Dml]: "bg-purple-500",
      [Position.Mod]: "bg-indigo-500",
      [Position.Expo]: "bg-teal-500",
      [Position.Other]: "bg-lime-500",
      [Position.Wash]: "bg-blue-400",
    };
    return colors[jobType] || "bg-gray-500";
  };

  const positionOptions: PositionOptions[] = [
    {
      value: Position.All,
      label: "All Positions",
      style: {
        badgeColor: getJobTypeColor(Position.All),
      },
    },
    {
      value: Position.Grill,
      label: "Grill",
      style: {
        badgeColor: getJobTypeColor(Position.Grill),
      },
    },
    {
      value: Position.Tortilla,
      label: "Tortilla",
      style: {
        badgeColor: getJobTypeColor(Position.Tortilla),
      },
    },
    {
      value: Position.Line,
      label: "Line",
      style: {
        badgeColor: getJobTypeColor(Position.Line),
      },
    },
    {
      value: Position.Prep,
      label: "Prep",
      style: {
        badgeColor: getJobTypeColor(Position.Prep),
      },
    },
    {
      value: Position.Salsa,
      label: "Salsa",
      style: {
        badgeColor: getJobTypeColor(Position.Salsa),
      },
    },
    {
      value: Position.Dml,
      label: "DML",
      style: {
        badgeColor: getJobTypeColor(Position.Dml),
      },
    },
    {
      value: Position.Cash,
      label: "Cash",
      style: {
        badgeColor: getJobTypeColor(Position.Cash),
      },
    },
    {
      value: Position.Expo,
      label: "Expo",
      style: {
        badgeColor: getJobTypeColor(Position.Expo),
      },
    },
    {
      value: Position.Mod,
      label: "MOD",
      style: {
        badgeColor: getJobTypeColor(Position.Mod),
      },
    },
    {
      value: Position.Wash,
      label: "Wash",
      style: {
        badgeColor: getJobTypeColor(Position.Wash),
      },
    },
    {
      value: Position.Other,
      label: "Other",
      style: {
        badgeColor: getJobTypeColor(Position.Other),
      },
    },
  ];

  const formatAvailabilities = (
    availabilities: (AvailabilitySlot & {
      employee?: Pick<
        Employee,
        "id" | "first_name" | "last_name" | "positions"
      >;
    })[]
  ): FormattedAvailability => {
    // Group availabilities by employee ID and start date
    return availabilities.reduce((grouped, availability) => {
      // Create a unique key combining employee ID and start date
      const employeeId = availability.employee?.id || 0;
      const startDate = availability.start_date
        ? new Date(availability.start_date).toISOString().split("T")[0]
        : "unknown";
      const key = `${employeeId}-${startDate}`;

      // If this is the first availability for this employee/date, create a new array
      if (!grouped[key]) {
        grouped[key] = [];
      }

      // Add the availability to the appropriate group
      grouped[key].push(availability);

      return grouped;
    }, {} as FormattedAvailability);
  };

  const formatAvailabilityTime = (
    availabilityArray: AvailabilitySlot[],
    dayOfWeek: number
  ): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    };

    const combineDateAndTime = (date: string, time: string): Date => {
      const combined = date.split("T")[0] + "T" + time.split("T")[1];
      return new Date(combined);
    };

    const formatTimeToLocal = (timeString: Date) => {
      return new Intl.DateTimeFormat("en-US", options).format(timeString);
    };

    const formattedSlots = availabilityArray.some((slot) => slot.day_of_week === dayOfWeek)
      ? Array.from(new Set(availabilityArray
        .filter((slot) => slot.day_of_week === dayOfWeek)
        .map((slot) => {
          const date = slot.start_date
            ? slot.start_date.toString()
            : new Date().toString();
          const startTime = combineDateAndTime(
            date,
            slot.start_time.toString()
          );
          const endTime = combineDateAndTime(date, slot.end_time.toString());

          return `${formatTimeToLocal(startTime)} - ${formatTimeToLocal(
            endTime
          )}`;
        })))
        .join(", ")
      : "N/A";
    return formattedSlots;
  };

  const fetchAvailabilities = useCallback(async () => {
    setLoading(true);
    const data = await fetchAvailabilitiesAPI(positionFilter, employeeFilter);
    setFilteredAvailabilities(formatAvailabilities(data!));
    setLoading(false);
  }, [positionFilter, employeeFilter]);



  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const refreshData = useCallback(() => {
    fetchAvailabilities();
    // fetchStats();
  }, [fetchAvailabilities]);

  useEffect(() => {
    setWeekStart(getMonday(new Date()).toISOString().split("T")[0]);
    refreshData();
  }, [refreshData]);

  // UPDATED: Fetch data when filters change
  useEffect(() => {
    refreshData();
  }, [positionFilter, employeeFilter, refreshData]);

  const handleAddAvailability = (): void => {
    setEditingSlots(null);
    setIsModalOpen(true);
  };

  const handleEditAvailability = (slots: AvailabilitySlot[]): void => {
    setEditingSlots(slots);
    setIsModalOpen(true);
  };

  // UPDATED: Handle edit employee
  // const handleEditAvailability = (availability: AvailabilitySlot): void => {
  //   setEditingAvailability(availability);
  //   setFormData({
  //     employee_id: availability.employee_id,
  //     position: availability.pos,
  //     monday: availability.monday || "",
  //     tuesday: availability.tuesday || "",
  //     wednesday: availability.wednesday || "",
  //     thursday: availability.thursday || "",
  //     friday: availability.friday || "",
  //     saturday: availability.saturday || "",
  //     sunday: availability.sunday || "",
  //     effectiveDate: availability.effectiveDate,
  //     daysHr: availability.daysHr,
  //   });
  //   setIsModalOpen(true);
  // };

  // UPDATED: Handle delete employee
  const handleDeleteEmployee = async (slots: AvailabilitySlot[]): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this availability grouping?")) {
      const firstSlot = slots[0];
      try {
        const res = await fetch(`/api/availability?employee_id=${firstSlot.employee_id}&start_date=${firstSlot.start_date}`, {
          method: "DELETE"
        });
        if (res.ok) {
          refreshData();
        } else {
          alert("Failed to delete availability");
        }
      } catch (error) {
        console.error("Error deleting availability group:", error);
      }
    }
  };

  // UPDATED: Export CSV function
  const exportToCSV = async (): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (positionFilter !== Position.All) params.append("jobType", positionFilter);
      if (employeeFilter) params.append("employeeName", employeeFilter);

      const response = await fetch(`/api/availability/export?${params}`);
      if (!response.ok) throw new Error("Failed to export CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chipotle_availability.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const handlePrint = (): void => {
    window.print();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="p-6 flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>Filter by Job Type</Label>
          <Select
            value={positionFilter}
            onValueChange={(value: Position) => setPositionFilter(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positionOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Search Employee</Label>
          <Input
            placeholder="Search employee name..."
            value={employeeFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmployeeFilter(e.target.value)
            }
            className="w-48"
          />
        </div>

        <div className="space-y-2">
          <Label>Week Starting</Label>
          <Input
            type="date"
            value={weekStart}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setWeekStart(e.target.value)
            }
            className="w-48"
          />
        </div>

        <Button
          onClick={handleAddAvailability}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Availability
        </Button>

        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>

        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>



      {/* Table */}
      <div className="overflow-x-auto h-full">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-sidebar">
            <tr>
              <th className="font-bold p-3 border border-sidebar-border text-left">
                Employee Name
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Job Type
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Monday
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Tuesday
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Wednesday
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Thursday
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Friday
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Saturday
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Sunday
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Days/Hr
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Effective Date
              </th>
              <th className="font-bold p-3 border border-sidebar-border text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(filteredAvailability).map(
              ([key, availabilityArray]) => (
                <tr key={`${key}`} className="hover:bg-sidebar-accent">
                  <td className="font-medium left-0 bg-sidebar p-3 border border-sidebar-border">
                    {filteredAvailability[key][0].employee
                      ? `${filteredAvailability[key][0].employee?.first_name} ${filteredAvailability[key][0].employee?.last_name}`
                      : "N/A"}
                  </td>
                  <td className="p-3 border border-sidebar-border text-center">
                    <Badge
                      className={`${getJobTypeColor(
                        (filteredAvailability[key][0].employee
                          ?.positions[0] as Position) || Position.All
                      )} text-white`}
                    >
                      {filteredAvailability[
                        key
                      ][0].employee?.positions[0]?.toUpperCase() || "N/A"}
                    </Badge>
                  </td>
                  <td className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground">
                    {formatAvailabilityTime(availabilityArray, 1)}
                  </td>
                  <td className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground">
                    {formatAvailabilityTime(availabilityArray, 2)}
                  </td>
                  <td className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground">
                    {formatAvailabilityTime(availabilityArray, 3)}
                  </td>
                  <td className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground">
                    {formatAvailabilityTime(availabilityArray, 4)}
                  </td>
                  <td className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground">
                    {formatAvailabilityTime(availabilityArray, 5)}
                  </td>
                  <td className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground">
                    {formatAvailabilityTime(availabilityArray, 6)}
                  </td>
                  <td className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground">
                    {formatAvailabilityTime(availabilityArray, 7)}
                  </td>
                  <td className="p-3 border border-sidebar-border text-center text-foreground">
                    {/* {availability.days_hr} */} 0
                  </td>
                  <td className="p-3 border border-sidebar-border text-center text-foreground">
                    {availabilityArray[0].start_date
                      ? new Date(availabilityArray[0].start_date)
                        .toISOString()
                        .split("T")[0]
                      : "N/A"}
                  </td>
                  <td className="p-3 border border-sidebar-border text-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditAvailability(availabilityArray)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteEmployee(availabilityArray)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <AvailabilityDialog
        isOpen={isModalOpen}
        onChangeState={(state: boolean) => setIsModalOpen(state)}
        editingSlots={editingSlots}
        positionOptions={positionOptions}
        inputFormData={null}
        onSave={() => refreshData()}
      />
    </div>
  );
};

export default ChipotleAvailabilityTracker;
