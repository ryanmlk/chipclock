"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multiSelect";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Employee, EmployeeRole } from "@/generated/prisma";
import { Position } from "@/types/enums";

interface EmployeeDialogProps {
    isOpen: boolean;
    onChangeState: (state: boolean) => void;
    employee: Employee | null;
    onSave: () => void;
}

const roleOptions = [
    { value: EmployeeRole.crew, label: "Crew" },
    { value: EmployeeRole.kitchen_manager, label: "KL (Kitchen Lead)" },
    { value: EmployeeRole.service_manager, label: "SL (Service Lead)" },
    { value: EmployeeRole.apprentice, label: "AP (Apprentice)" },
    { value: EmployeeRole.manager, label: "GM (General Manager)" },
    { value: EmployeeRole.certified_trainer, label: "CT (Certified Trainer)" },
];

const positionOptions = Object.values(Position)
    .filter((pos) => pos !== Position.All)
    .map((pos) => ({ value: pos, label: pos }));

export function EmployeeDialog({
    isOpen,
    onChangeState,
    employee,
    onSave,
}: EmployeeDialogProps) {
    const [formData, setFormData] = useState<Partial<Employee>>({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: EmployeeRole.crew,
        positions: [],
        status: "active",
    });
    const [primaryPosition, setPrimaryPosition] = useState<string>("");

    useEffect(() => {
        if (employee) {
            setFormData(employee);
            setPrimaryPosition(employee.positions[0] || "");
        } else {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                role: EmployeeRole.crew,
                positions: [],
                status: "active",
            });
            setPrimaryPosition("");
        }
    }, [employee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure primary position is at the start of the array
            const otherPositions = (formData.positions || []).filter(p => p !== primaryPosition);
            const finalPositions = primaryPosition ? [primaryPosition, ...otherPositions] : otherPositions;

            const method = employee ? "PATCH" : "POST";
            const response = await fetch("/api/employees", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employee ? { ...formData, id: employee.id, positions: finalPositions } : { ...formData, positions: finalPositions }),
            });

            if (!response.ok) throw new Error("Failed to save employee");

            onSave();
            onChangeState(false);
        } catch (error) {
            console.error("Error saving employee:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onChangeState}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {employee ? "Edit Employee" : "Add New Employee"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={formData.first_name || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, first_name: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={formData.last_name || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, last_name: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={formData.phone || ""}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(val) =>
                                setFormData({ ...formData, role: val as EmployeeRole })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="primary_position">Primary Position</Label>
                        <Select
                            value={primaryPosition}
                            onValueChange={(val) => setPrimaryPosition(val)}
                        >
                            <SelectTrigger id="primary_position">
                                <SelectValue placeholder="Select primary position" />
                            </SelectTrigger>
                            <SelectContent>
                                {positionOptions.map((pos) => (
                                    <SelectItem key={pos.value} value={pos.value}>
                                        {pos.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Trainable Positions</Label>
                        <MultiSelect
                            options={positionOptions}
                            onValueChange={(vals) =>
                                setFormData({ ...formData, positions: vals })
                            }
                            defaultValue={formData.positions || []}
                        />
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
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
