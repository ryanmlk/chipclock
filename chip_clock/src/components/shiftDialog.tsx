"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EmployeeSelect } from "@/components/employeeSelect";
import { TimeInput } from "@/components/timeInput";
import { Input } from "@/components/ui/input";
import type { Employee, Shift } from "@/generated/prisma/client";
import { Position } from "@/types/enums";
import { format } from "date-fns";
import { formatTimeLocal } from "@/lib/dateUtils";

interface ShiftDialogProps {
    isOpen: boolean;
    onChangeState: (state: boolean) => void;
    shift: (Shift & { employee?: Employee }) | null;
    selectedDate?: Date;
    onSave: () => void;
}

export function ShiftDialog({
    isOpen,
    onChangeState,
    shift,
    selectedDate,
    onSave,
}: ShiftDialogProps) {
    const [employeeSearchRes, setEmployeeSearchRes] = useState<
        Pick<Employee, "id" | "first_name" | "last_name">[]
    >([]);
    const [formData, setFormData] = useState({
        employee_id: "",
        employee_name: "",
        date: format(new Date(), "yyyy-MM-dd"),
        start_time: "07:00",
        end_time: "15:00",
        position: Position.Prep as string,
    });

    useEffect(() => {
        if (shift) {
            setFormData({
                employee_id: shift.employee_id,
                employee_name: shift.employee ? `${shift.employee.first_name} ${shift.employee.last_name}` : "",
                date: format(new Date(shift.shift_start), "yyyy-MM-dd"),
                start_time: formatTimeLocal(shift.shift_start),
                end_time: formatTimeLocal(shift.shift_end),
                position: shift.position || Position.Prep,
            });
        } else if (selectedDate) {
            setFormData(prev => ({
                ...prev,
                date: format(selectedDate, "yyyy-MM-dd"),
            }));
        }
    }, [shift, selectedDate]);

    async function searchEmployees(query: string) {
        if (!query) return;
        const res = await fetch(`/api/employees?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setEmployeeSearchRes(data);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const start = new Date(`${formData.date}T${formData.start_time}:00`);
            const end = new Date(`${formData.date}T${formData.end_time}:00`);

            // Handle overnight shifts if end time is before start time
            if (end < start) {
                end.setDate(end.getDate() + 1);
            }

            const payload = {
                id: shift?.id,
                employee_id: formData.employee_id,
                shift_start: start.toISOString(),
                shift_end: end.toISOString(),
                position: formData.position,
                hours: ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2),
            };

            const method = shift ? "PATCH" : "POST";
            const response = await fetch("/api/schedule", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save shift");

            onSave();
            onChangeState(false);
        } catch (error) {
            console.error("Error saving shift:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onChangeState}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {shift ? "Edit Shift" : "Add New Shift"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Employee</Label>
                        <EmployeeSelect
                            employees={employeeSearchRes}
                            value={
                                formData.employee_id
                                    ? { id: formData.employee_id, name: formData.employee_name }
                                    : null
                            }
                            onSelect={(val) => {
                                setFormData(prev => ({ ...prev, employee_id: val?.id ?? "", employee_name: val?.name ?? "" }));
                            }}
                            onChange={(val) => searchEmployees(val)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <TimeInput
                                value={formData.start_time}
                                onChange={(val) => setFormData({ ...formData, start_time: val || "07:00" })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <TimeInput
                                value={formData.end_time}
                                onChange={(val) => setFormData({ ...formData, end_time: val || "15:00" })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Select
                            value={formData.position}
                            onValueChange={(val) => setFormData({ ...formData, position: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(Position).filter(p => p !== Position.All).map((pos) => (
                                    <SelectItem key={pos} value={pos}>
                                        {pos.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onChangeState(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Save Shift
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
