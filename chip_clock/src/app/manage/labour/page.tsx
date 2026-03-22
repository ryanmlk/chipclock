"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Calculator, Settings } from "lucide-react";
import { isSameDay } from "date-fns";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import Link from 'next/link';

import { useLabourStore } from "@/store/useLabourStore";
import { useScheduleStore } from "@/store/useScheduleStore";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { formatDateLocal } from "@/lib/dateUtils";
import { api } from "@/lib/api";
import { toast } from "sonner";

const LabourManagementPage = () => {
    const [isMounted, setIsMounted] = React.useState(false);
    const [isTimeModified, setIsTimeModified] = React.useState(false);
    const [selectedDateTime, setSelectedDateTime] = React.useState<Date>(new Date());
    const { matrix, loading: labourLoading, sales, setSales, fetchLabourData } = useLabourStore();
    const { shifts: allShifts, loading: scheduleLoading, fetchShifts } = useScheduleStore();

    useEffect(() => {
        fetchLabourData();
        // Fetch only today's shifts for this page, store will skip if part of a cached week
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        fetchShifts({ start: today, end: today });
        setIsMounted(true);
    }, [fetchLabourData, fetchShifts]);

    const loading = labourLoading || scheduleLoading;
    const now = selectedDateTime;
    // Filter the global shifts list to only show today's non-manager shifts
    const shifts = allShifts.filter(s =>
        isSameDay(new Date(s.shift_start), now) &&
        s.employee?.role?.toLowerCase() !== 'manager'
    );

    // Calculate scheduled hours up to now
    const scheduledHoursUpToNow = shifts.reduce((acc, shift) => {
        const start = new Date(shift.shift_start);
        const end = new Date(shift.shift_end);
        if (start >= now) return acc;
        const effectiveEnd = end < now ? end : now;
        const hours = (effectiveEnd.getTime() - start.getTime()) / (1000 * 60 * 60);
        return acc + hours;
    }, 0);

    // Default current hours in store if empty
    useEffect(() => {
        if (!loading && shifts.length > 0 && sales.actualHours === "" && scheduledHoursUpToNow > 0) {
            setSales({ ...sales, actualHours: scheduledHoursUpToNow.toFixed(2) });
        }
    }, [loading, shifts.length, sales.actualHours, scheduledHoursUpToNow, setSales, sales]);

    const totalScheduledHours = shifts.reduce((acc, shift) => {
        const start = new Date(shift.shift_start);
        const end = new Date(shift.shift_end);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return acc + hours;
    }, 0);

    const getAllowedHours = (targetSales: number) => {
        if (matrix.length === 0) return 0;
        // Find first threshold that covers the sales projection as an upper limit
        const sorted = [...matrix].sort((a, b) => a.sales_level - b.sales_level);
        const match = sorted.find(m => m.sales_level >= targetSales);
        return match ? match.hours_allowed : (sorted[sorted.length - 1]?.hours_allowed || 0);
    };

    const remainingScheduledHours = shifts.reduce((acc, shift) => {
        const start = new Date(shift.shift_start);
        const end = new Date(shift.shift_end);
        if (end <= now) return acc;
        const effectiveStart = start > now ? start : now;
        const hours = (end.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60);
        return acc + hours;
    }, 0);

    const effectiveCurrentHours = sales.actualHours
        ? (parseFloat(sales.actualHours) || 0) + remainingScheduledHours
        : totalScheduledHours;

    const [calculatedMetrics, setCalculatedMetrics] = React.useState({
        currentAllowed: 0,
        projectedAllowed: 0,
        projectedGainLoss: 0,
        currentGainLoss: 0,
        salesTarget: "N/A" as string | number,
        remainingHours: 0
    });

    const handleCalculate = async () => {
        if (isTimeModified) {
            toast.info("Simulation mode: metrics not saved to database");
            return;
        }

        // Save to DB
        try {
            await api.labour.saveKPI({
                date: formatDateLocal(now),
                sales_projection: sales.projection,
                actual_sales: sales.current,
                actual_hours: sales.actualHours
            });
            toast.success("Metrics saved successfully");
            // Also refresh data
            fetchLabourData(true);
        } catch (error) {
            console.error("Error saving KPIs:", error);
            toast.error("Failed to save metrics to database");
        }
    };

    // Auto-calculate metrics when dependencies change
    useEffect(() => {
        const cAllowed = getAllowedHours(parseFloat(sales.current) || 0);
        const pAllowed = getAllowedHours(parseFloat(sales.projection) || 0);

        const predictedClosingHours = (parseFloat(sales.actualHours) || 0) + remainingScheduledHours;
        const pGainLoss = pAllowed - totalScheduledHours;
        const cGainLoss = cAllowed - effectiveCurrentHours;

        const sorted = [...matrix].sort((a, b) => a.sales_level - b.sales_level);
        let target = sorted.find(m => m.hours_allowed >= predictedClosingHours);

        if (!target && sorted.length > 0) {
            target = sorted[sorted.length - 1];
        }

        const sTarget = target ? target.sales_level : "N/A";

        setCalculatedMetrics({
            currentAllowed: cAllowed,
            projectedAllowed: pAllowed,
            projectedGainLoss: pGainLoss,
            currentGainLoss: cGainLoss,
            salesTarget: sTarget,
            remainingHours: remainingScheduledHours
        });
    }, [sales.current, sales.projection, sales.actualHours, matrix, remainingScheduledHours, totalScheduledHours, effectiveCurrentHours]);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-6 relative min-h-[400px]">
            {loading && <LoadingOverlay message="Fetching latest labour data..." />}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex flex-col items-start gap-2 mb-2">
                        Labour Management
                        <DateTimePicker
                            value={selectedDateTime}
                            onChange={(newDate) => {
                                setIsTimeModified(true);
                                setSelectedDateTime(newDate);
                                // Recalculate scheduled hours up to the new time
                                const todaysShifts = allShifts.filter(s => isSameDay(new Date(s.shift_start), newDate));
                                const newScheduledHours = todaysShifts.reduce((acc, shift) => {
                                    const start = new Date(shift.shift_start);
                                    const end = new Date(shift.shift_end);
                                    if (start >= newDate) return acc;
                                    const effectiveEnd = end < newDate ? end : newDate;
                                    const hours = (effectiveEnd.getTime() - start.getTime()) / (1000 * 60 * 60);
                                    return acc + hours;
                                }, 0);
                                setSales({ ...sales, actualHours: newScheduledHours.toFixed(2) });
                            }}
                        />
                    </h1>
                    <p className="text-muted-foreground">Calculate and track labour based on sales performance.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/manage/labour/config">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Matrix
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Calculator
                        </CardTitle>
                        <CardDescription>Enter today&apos;s sales data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Hours (Worked)</Label>
                            <Input
                                type="number"
                                placeholder="Total hours clocked in"
                                value={sales.actualHours}
                                onChange={(e) => setSales({ ...sales, actualHours: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Current Sales ($)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 4500"
                                value={sales.current}
                                onChange={(e) => setSales({ ...sales, current: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>EOD Projection ($)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 7500"
                                value={sales.projection}
                                onChange={(e) => setSales({ ...sales, projection: e.target.value })}
                            />
                        </div>
                        <Button className="w-full mt-4" onClick={handleCalculate}>
                            Calculate
                        </Button>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className={calculatedMetrics.currentGainLoss >= 0 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Predicted Gain/Loss</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${calculatedMetrics.currentGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {calculatedMetrics.currentGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                {calculatedMetrics.currentGainLoss.toFixed(2)} hrs
                            </div>
                            <p className="text-xs text-muted-foreground">Expected closing gain/loss at current sales</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Target</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-500" />
                                ${calculatedMetrics.salesTarget}
                            </div>
                            <p className="text-xs text-muted-foreground">To break even with predicted closing hours</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                                <TrendingUp className="w-5 h-5" />
                                {calculatedMetrics.remainingHours.toFixed(2)} hrs
                            </div>
                            <p className="text-xs text-muted-foreground">From now until end of shifts</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Allowed (at Projection)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{calculatedMetrics.projectedAllowed.toFixed(2)} hrs</div>
                            <p className="text-xs text-muted-foreground">Based on labour matrix</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Labour Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-primary/5 border-primary/20 md:col-span-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Scheduled</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-primary">
                                    {totalScheduledHours.toFixed(2)} hrs
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Based on today&apos;s scheduled shifts</p>
                            </CardContent>
                        </Card>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Impact of Projection</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Hitting your projection of ${sales.projection || "0"} will {calculatedMetrics.projectedGainLoss >= 0 ? "gain" : "cost"} you <span className="font-medium text-foreground">{Math.abs(calculatedMetrics.projectedGainLoss).toFixed(2)} hours</span> relative to your current schedule.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Team Efficiency</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        You have <span className="font-medium text-foreground">{shifts.length}</span> people working today. Average shift length: <span className="font-medium text-foreground">{(totalScheduledHours / (shifts.length || 1)).toFixed(1)} hrs</span>.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LabourManagementPage;
