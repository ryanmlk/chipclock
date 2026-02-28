"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Calendar as CalendarIcon, FileText } from "lucide-react";
import { Position } from "@/types/enums";
import type { Shift, Employee } from "@/generated/prisma/client";
import { ShiftDialog } from "@/components/shiftDialog";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { formatTimeLocal } from "@/lib/dateUtils";

import { useScheduleStore } from "@/store/useScheduleStore";
import { api } from "@/lib/api";
import { LoadingOverlay } from "@/components/LoadingOverlay";

type ShiftWithEmployee = Shift & { employee: Employee };

const SchedulePage = () => {
    const {
        shifts,
        loading,
        selectedDate,
        view,
        setSelectedDate,
        setView,
        fetchShifts
    } = useScheduleStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<ShiftWithEmployee | null>(null);

    useEffect(() => {
        fetchShifts();
    }, [selectedDate, fetchShifts]);

    const handleDeleteShift = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this shift?")) return;
        try {
            await api.labour.deleteShift(id);
            fetchShifts({ force: true }); // force refetch
        } catch (error) {
            console.error("Error deleting shift:", error);
        }
    };

    const dayShifts = shifts.filter(s => isSameDay(new Date(s.shift_start), selectedDate));

    // Group shifts by position for deployment view
    const groupedShifts = dayShifts.reduce((acc, shift) => {
        const pos = shift.position || "Other";
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(shift);
        return acc;
    }, {} as Record<string, ShiftWithEmployee[]>);

    const positions = Object.values(Position).filter(p => p !== Position.All);

    return (
        <div className="space-y-6 relative min-h-[400px]">
            {loading && <LoadingOverlay message="Synchronizing shifts..." />}
            <div className="flex flex-wrap items-end gap-4 justify-between">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-2">
                        <Label>Selected Date</Label>
                        <Input
                            type="date"
                            value={format(selectedDate, "yyyy-MM-dd")}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="w-48"
                        />
                    </div>
                    <div className="space-x-2 pb-1">
                        <Button
                            variant={view === "daily" ? "default" : "outline"}
                            onClick={() => setView("daily")}
                        >
                            Daily Deployment
                        </Button>
                        <Button
                            variant={view === "weekly" ? "default" : "outline"}
                            onClick={() => setView("weekly")}
                        >
                            Weekly Overview
                        </Button>
                    </div>
                </div>

                <div className="space-x-2">
                    <Button variant="outline" asChild>
                        <a href="/public/schedules" target="_blank">
                            <FileText className="w-4 h-4 mr-2" />
                            View Original PDF
                        </a>
                    </Button>
                    <Button onClick={() => { setEditingShift(null); setIsModalOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Shift
                    </Button>
                </div>
            </div>

            {view === "daily" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {positions.map((pos) => (
                        <Card key={pos} className="bg-sidebar border-sidebar-border shadow-sm">
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                                    {pos}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(groupedShifts[pos] || []).length > 0 ? (
                                    groupedShifts[pos].map((shift) => (
                                        <div
                                            key={shift.id}
                                            className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50 group"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {shift.employee.first_name} {shift.employee.last_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatTimeLocal(shift.shift_start)} - {formatTimeLocal(shift.shift_end)}
                                                </p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7"
                                                    onClick={() => { setEditingShift(shift); setIsModalOpen(true); }}
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() => handleDeleteShift(shift.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No one scheduled</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Summary ({format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "MMM d")} - {format(addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6), "MMM d")})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-muted-foreground italic">Weekly grid view coming soon... Showing shift count for now: {shifts.length} shifts scheduled this week.</div>
                    </CardContent>
                </Card>
            )}

            <ShiftDialog
                isOpen={isModalOpen}
                onChangeState={setIsModalOpen}
                shift={editingShift}
                selectedDate={selectedDate}
                onSave={fetchShifts}
            />
        </div>
    );
};

export default SchedulePage;
