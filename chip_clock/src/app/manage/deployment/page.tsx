"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Trash2, Edit, Plus, FileText } from "lucide-react";
import { Position } from "@/types/enums";
import type { Shift, Employee } from "@/generated/prisma/client";
import { ShiftDialog } from "@/components/shiftDialog";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { formatTimeLocal } from "@/lib/dateUtils";

import { useScheduleStore } from "@/store/useScheduleStore";
import { api } from "@/lib/api";
import { LoadingOverlay } from "@/components/LoadingOverlay";

type ShiftWithEmployee = Shift & { employee: Employee };

const getJobTypeColors = (jobType: string): string => {
    switch (jobType) {
        case Position.Grill: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case Position.Prep: return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
        case Position.Cash: return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
        case Position.Dml: return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
        case Position.Expo: return "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400";
        case Position.Line: return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
        case Position.Tortilla: return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
        case Position.Wash: return "bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400";
        default: return "bg-primary/10 text-primary";
    }
};

const getTimeFilter = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    if (timeInMinutes < 11 * 60 + 30) return "Opening";
    if (timeInMinutes < 13 * 60 + 30) return "AM Peak";
    if (timeInMinutes < 17 * 60 + 30) return "Mid Day";
    if (timeInMinutes < 19 * 60 + 30) return "PM Peak";
    return "Closing";
};

const DeploymentPage = () => {
    const {
        shifts,
        loading,
        selectedDate,
        view,
        setSelectedDate,
        fetchShifts
    } = useScheduleStore();

    const [isMounted, setIsMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<ShiftWithEmployee | null>(null);

    const [timeFilter, setTimeFilter] = useState<string>(getTimeFilter(selectedDate));

    useEffect(() => {
        setIsMounted(true);
        fetchShifts();
        setTimeFilter(getTimeFilter(selectedDate));
    }, [selectedDate, fetchShifts]);

    if (!isMounted) {
        return null;
    }

    const handleDeleteShift = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this shift?")) return;

        const previousShifts = useScheduleStore.getState().shifts;
        useScheduleStore.setState({ shifts: previousShifts.filter(s => s.id !== id) });

        try {
            await api.labour.deleteShift(id);
            toast.success("Shift deleted successfully");
        } catch (error) {
            console.error("Error deleting shift:", error);
            useScheduleStore.setState({ shifts: previousShifts });
            toast.error("Failed to complete delete operation");
        }
    };

    let dayShifts = shifts.filter(s => isSameDay(new Date(s.shift_start), selectedDate));

    if (timeFilter !== "All") {
        const getBlockDate = (hours: number, minutes: number = 0) => {
            const d = new Date(selectedDate);
            d.setHours(hours, minutes, 0, 0);
            return d.getTime();
        };

        let blockStart = 0;
        let blockEnd = 0;

        switch (timeFilter) {
            case "Opening":
                blockStart = getBlockDate(0, 0);
                blockEnd = getBlockDate(11, 30);
                break;
            case "AM Peak":
                blockStart = getBlockDate(11, 30);
                blockEnd = getBlockDate(13, 30);
                break;
            case "Mid Day":
                blockStart = getBlockDate(13, 30);
                blockEnd = getBlockDate(17, 30);
                break;
            case "PM Peak":
                blockStart = getBlockDate(17, 30);
                blockEnd = getBlockDate(19, 30);
                break;
            case "Closing":
                blockStart = getBlockDate(19, 30);
                blockEnd = getBlockDate(23, 59);
                break;
        }

        dayShifts = dayShifts.filter(shift => {
            const sStart = new Date(shift.shift_start).getTime();
            const sEnd = new Date(shift.shift_end).getTime();
            // A shift is in the block if it overlaps with the block's time window.
            return sStart < blockEnd && blockStart < sEnd;
        });
    }

    return (
        <div className="space-y-6 relative min-h-[400px]">
            {loading && <LoadingOverlay message="Synchronizing shifts..." />}
            <div className="flex flex-wrap items-end gap-4 justify-between">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-2">
                        <Label>Selected Date & Time</Label>
                        <DateTimePicker
                            value={selectedDate}
                            onChange={(newDate) => {
                                setSelectedDate(newDate);
                            }}
                        />
                    </div>
                </div>

                <div className="space-x-2">
                    <Button onClick={() => { setEditingShift(null); setIsModalOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Shift
                    </Button>
                </div>
            </div>

            {view === "daily" ? (
                <Card className="bg-card border-border shadow-sm rounded-2xl h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-2xl font-bold">Current Deployment</CardTitle>
                            <p className="text-slate-500 mt-1">{dayShifts.length} Staff On-Station</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit flex-wrap">
                            {["All", "Opening", "AM Peak", "Mid Day", "PM Peak", "Closing"].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setTimeFilter(filter)}
                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${timeFilter === filter
                                        ? "bg-card text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {dayShifts.map((shift) => {
                                const sStart = new Date(shift.shift_start).getTime();
                                const sEnd = new Date(shift.shift_end).getTime();
                                const durationHours = (sEnd - sStart) / (1000 * 60 * 60);
                                const now = Date.now();
                                const isShiftActive = now >= sStart && now <= sEnd;
                                return (
                                    <div
                                        key={shift.id}
                                        className="group relative p-6 border border-border bg-surface/30 dark:bg-slate-900/30 rounded-2xl cursor-pointer hover:border-primary/50 transition-all"
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                                            <button
                                                className="p-1.5 bg-card border border-border rounded-md text-slate-500 hover:text-primary transition-colors shadow-sm"
                                                title="Edit Shift"
                                                onClick={(e) => { e.stopPropagation(); setEditingShift(shift); setIsModalOpen(true); }}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-1.5 bg-card border border-border rounded-md text-slate-500 hover:text-destructive transition-colors shadow-sm"
                                                title="Delete Shift"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteShift(shift.id); }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getJobTypeColors(shift.position || '')}`}>
                                                {shift.position || 'Other'}
                                            </span>
                                            <span className="text-xs font-mono text-slate-400">
                                                {formatTimeLocal(shift.shift_start)} - {formatTimeLocal(shift.shift_end)} ({durationHours.toFixed(1)}h)
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-lg mb-1">
                                            {shift.employee?.first_name} {shift.employee?.last_name}
                                        </h4>
                                        <div className="mt-2 flex items-center gap-1">
                                            <div className={`w-3 h-3 rounded-full ${isShiftActive ? "bg-green-500" : "bg-slate-400"}`}></div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {isShiftActive ? "Station Active" : "Station Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div
                                onClick={() => { setEditingShift(null); setIsModalOpen(true); }}
                                className="p-6 border border-dashed border-border flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer rounded-2xl bg-surface/10 min-h-[160px]"
                            >
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="text-sm font-bold uppercase tracking-wider">Add Shift</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="rounded-2xl">
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
                onSave={() => { }}
            />
        </div>
    );
};

export default DeploymentPage;
