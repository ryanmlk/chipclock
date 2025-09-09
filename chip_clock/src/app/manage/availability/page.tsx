"use client";

import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Download, Printer } from "lucide-react";

// Type definitions (updated to match API response)
interface Employee {
  id: number;
  name: string;
  job_type: JobType; // Changed from jobType to job_type
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  days_hr: string; // Changed from daysHr to days_hr
  effective_date: string; // Changed from effectiveDate to effective_date
}

interface Stats {
  totalEmployees: number;
  availableToday: number;
  bestCoveredDay: string;
}

type JobType =
  | "grill"
  | "tortilla"
  | "line"
  | "prep"
  | "closing prep"
  | "closing salsa"
  | "closing dml"
  | "cash";
type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface JobTypeOption {
  value: JobType | "all";
  label: string;
}

interface FormData {
  name: string;
  email: string; // Added email field
  jobType: JobType;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  effectiveDate: string;
  daysHr?: string; // Optional, will be calculated
}

const ChipotleAvailabilityTracker: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [jobFilter, setJobFilter] = useState<JobType | "all">("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [weekStart, setWeekStart] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    availableToday: 0,
    bestCoveredDay: "-",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    jobType: "grill",
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
    effectiveDate: "",
    daysHr: "",
  });

  const jobTypes: JobTypeOption[] = [
    { value: "all", label: "All Positions" },
    { value: "grill", label: "Grill" },
    { value: "tortilla", label: "Tortilla" },
    { value: "line", label: "Line" },
    { value: "prep", label: "Prep" },
    { value: "closing prep", label: "Closing Prep" },
    { value: "closing salsa", label: "Closing Salsa" },
    { value: "closing dml", label: "Closing DML" },
    { value: "cash", label: "Cash" },
  ];

  // API FUNCTIONS - NEW
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (jobFilter !== "all") params.append("jobType", jobFilter);
      if (employeeFilter) params.append("employeeName", employeeFilter);

      const response = await fetch(`/api/availability?${params}`);
      if (!response.ok) throw new Error("Failed to fetch employees");

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      // You might want to add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/availability/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const createEmployee = async (formData: FormData) => {
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          jobType: formData.jobType,
          monday: formData.monday,
          tuesday: formData.tuesday,
          wednesday: formData.wednesday,
          thursday: formData.thursday,
          friday: formData.friday,
          saturday: formData.saturday,
          sunday: formData.sunday,
          daysHr: formData.daysHr || calculateDaysHours(formData),
          effectiveDate: formData.effectiveDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to create employee");

      // Refresh data after creation
      await fetchEmployees();
      await fetchStats();
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  };

  const updateEmployee = async (id: number, formData: FormData) => {
    try {
      const response = await fetch(`/api/availability/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          jobType: formData.jobType,
          monday: formData.monday,
          tuesday: formData.tuesday,
          wednesday: formData.wednesday,
          thursday: formData.thursday,
          friday: formData.friday,
          saturday: formData.saturday,
          sunday: formData.sunday,
          daysHr: formData.daysHr || calculateDaysHours(formData),
          effectiveDate: formData.effectiveDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to update employee");

      // Refresh data after update
      await fetchEmployees();
      await fetchStats();
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      const response = await fetch(`/api/availability/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete employee");

      // Refresh data after deletion
      await fetchEmployees();
      await fetchStats();
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    }
  };

  const quickEditEmployee = async (
    id: number,
    day: DayOfWeek,
    value: string
  ) => {
    try {
      const response = await fetch(`/api/availability/${id}/quick-edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day,
          value,
        }),
      });

      if (!response.ok) throw new Error("Failed to update employee");

      // Refresh data after update
      await fetchEmployees();
      await fetchStats();
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const getJobTypeColor = (jobType: JobType): string => {
    const colors: Record<JobType, string> = {
      grill: "bg-amber-700",
      tortilla: "bg-orange-600",
      line: "bg-red-500",
      prep: "bg-green-500",
      "closing prep": "bg-blue-500",
      "closing salsa": "bg-pink-500",
      "closing dml": "bg-purple-500",
      cash: "bg-gray-500",
    };
    return colors[jobType] || "bg-gray-500";
  };

  const calculateDaysHours = (
    schedule: Omit<FormData, "name" | "email" | "jobType" | "effectiveDate">
  ): string => {
    const days: string[] = [
      schedule.monday,
      schedule.tuesday,
      schedule.wednesday,
      schedule.thursday,
      schedule.friday,
      schedule.saturday,
      schedule.sunday,
    ];
    const workingDays = days.filter(
      (day) => day && day !== "N/A" && day.trim() !== ""
    ).length;
    return workingDays > 4 ? "40" : workingDays > 2 ? "30" : "PT";
  };

  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // UPDATED: Load data on component mount and when filters change
  useEffect(() => {
    setWeekStart(getMonday(new Date()).toISOString().split("T")[0]);
    setFormData((prev) => ({
      ...prev,
      effectiveDate: new Date().toISOString().split("T")[0],
    }));

    // Initial data load
    fetchEmployees();
    fetchStats();
  }, []);

  // UPDATED: Fetch data when filters change
  useEffect(() => {
    fetchEmployees();
  }, [jobFilter, employeeFilter]);

  // UPDATED: Filter employees locally (since API handles filtering now)
  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleAddEmployee = (): void => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      jobType: "grill",
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
      effectiveDate: new Date().toISOString().split("T")[0],
      daysHr: "",
    });
    setIsModalOpen(true);
  };

  // UPDATED: Handle edit employee
  const handleEditEmployee = (employee: Employee): void => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: "", // You might want to store email in the employee object
      jobType: employee.job_type,
      monday: employee.monday || "",
      tuesday: employee.tuesday || "",
      wednesday: employee.wednesday || "",
      thursday: employee.thursday || "",
      friday: employee.friday || "",
      saturday: employee.saturday || "",
      sunday: employee.sunday || "",
      effectiveDate: employee.effective_date,
      daysHr: employee.days_hr,
    });
    setIsModalOpen(true);
  };

  // UPDATED: Handle delete employee
  const handleDeleteEmployee = async (id: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  };

  // UPDATED: Handle quick edit
  const handleQuickEdit = async (
    employeeId: number,
    day: DayOfWeek
  ): Promise<void> => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    const newValue = window.prompt(
      `Enter availability for ${day}:`,
      employee[day] || ""
    );
    if (newValue !== null) {
      await quickEditEmployee(employeeId, day, newValue);
    }
  };

  // UPDATED: Handle form submit
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Handle error - maybe show a toast notification
      console.error("Error submitting form:", error);
    }
  };

  const handleFormChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // UPDATED: Export CSV function
  const exportToCSV = async (): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (jobFilter !== "all") params.append("jobType", jobFilter);
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
  if (loading && employees.length === 0) {
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
            value={jobFilter}
            onValueChange={(value: JobType | "all") => setJobFilter(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((type) => (
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
          onClick={handleAddEmployee}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
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

      {/* UPDATED: Stats using API data */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-white">
              {stats.totalEmployees}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Total Employees
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-white">
              {stats.availableToday}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Available Today
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-gray-700 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-white">
              {stats.bestCoveredDay}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Best Covered Day
            </CardDescription>
          </CardHeader>
        </Card>
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
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-sidebar-accent">
                <td className="font-medium left-0 bg-sidebar p-3 border border-sidebar-border">
                  {employee.name}
                </td>
                <td className="p-3 border border-sidebar-border text-center">
                  <Badge
                    className={`${getJobTypeColor(
                      employee.job_type
                    )} text-white`}
                  >
                    {employee.job_type.toUpperCase()}
                  </Badge>
                </td>
                <td
                  className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground"
                  onClick={() => handleQuickEdit(employee.id, "monday")}
                >
                  {employee.monday || "N/A"}
                </td>
                <td
                  className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground"
                  onClick={() => handleQuickEdit(employee.id, "tuesday")}
                >
                  {employee.tuesday || "N/A"}
                </td>
                <td
                  className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground"
                  onClick={() => handleQuickEdit(employee.id, "wednesday")}
                >
                  {employee.wednesday || "N/A"}
                </td>
                <td
                  className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground"
                  onClick={() => handleQuickEdit(employee.id, "thursday")}
                >
                  {employee.thursday || "N/A"}
                </td>
                <td
                  className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground"
                  onClick={() => handleQuickEdit(employee.id, "friday")}
                >
                  {employee.friday || "N/A"}
                </td>
                <td
                  className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground"
                  onClick={() => handleQuickEdit(employee.id, "saturday")}
                >
                  {employee.saturday || "N/A"}
                </td>
                <td
                  className="cursor-pointer hover:bg-gray-400 p-3 border border-sidebar-border text-center text-foreground"
                  onClick={() => handleQuickEdit(employee.id, "sunday")}
                >
                  {employee.sunday || "N/A"}
                </td>
                <td className="p-3 border border-sidebar-border text-center text-foreground">
                  {employee.days_hr}
                </td>
                <td className="p-3 border border-sidebar-border text-center text-foreground">
                  {new Date(employee.effective_date).toLocaleDateString()}
                </td>
                <td className="p-3 border border-sidebar-border text-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UPDATED: Modal with email field */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange("name", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange("email", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Hrs Per Week</Label>
              <Input
                value={formData.daysHr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange("daysHr", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Primary Job Type</Label>
              <Select
                value={formData.jobType}
                onValueChange={(value: JobType) =>
                  handleFormChange("jobType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.slice(1).map((type) => (
                    <SelectItem key={type.value} value={type.value as JobType}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Effective Date</Label>
              <Input
                type="date"
                required
                value={formData.effectiveDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFormChange("effectiveDate", e.target.value)
                }
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Weekly Availability
              </Label>

              {(
                [
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ] as DayOfWeek[]
              ).map((day) => (
                <div key={day} className="space-y-1">
                  <Label className="capitalize">{day}</Label>
                  <Input
                    placeholder="e.g., 9am-5pm, A/T, N/A"
                    value={formData[day]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFormChange(day, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
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
    </div>
  );
};

export default ChipotleAvailabilityTracker;
