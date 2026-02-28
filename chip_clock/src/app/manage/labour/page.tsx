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
import { Settings, TrendingUp, TrendingDown, Target, Calculator } from "lucide-react";
import { isSameDay } from "date-fns";

import { useLabourStore } from "@/store/useLabourStore";
import { useScheduleStore } from "@/store/useScheduleStore";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const LabourManagementPage = () => {
    const { matrix, loading: labourLoading, sales, setSales, fetchLabourData } = useLabourStore();
    const { shifts: allShifts, loading: scheduleLoading, fetchShifts } = useScheduleStore();

    useEffect(() => {
        fetchLabourData();
        // Fetch only today's shifts for this page, store will skip if part of a cached week
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        fetchShifts({ start: today, end: today });
    }, [fetchLabourData, fetchShifts]);

    const loading = labourLoading || scheduleLoading;
    const now = new Date();
    // Filter the global shifts list to only show today's shifts for these calculations
    const shifts = allShifts.filter(s => isSameDay(new Date(s.shift_start), now));

    const totalScheduledHours = shifts.reduce((acc, shift) => {
        const h = shift.hours ? parseFloat(shift.hours) : 0;
        return h === 10 ? acc : acc + h;
    }, 0);

    const getAllowedHours = (targetSales: number) => {
        if (matrix.length === 0) return 0;
        // Find highest threshold that is <= targetSales
        const sorted = [...matrix].sort((a, b) => b.sales_level - a.sales_level);
        const match = sorted.find(m => m.sales_level <= targetSales);
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

    const currentAllowed = getAllowedHours(parseFloat(sales.current) || 0);
    const projectedAllowed = getAllowedHours(parseFloat(sales.projection) || 0);

    const projectedGainLoss = projectedAllowed - totalScheduledHours;
    const currentGainLoss = currentAllowed - effectiveCurrentHours;

    // Find sales target to match totalScheduledHours
    const findSalesTarget = () => {
        const sorted = [...matrix].sort((a, b) => a.sales_level - b.sales_level);
        const target = sorted.find(m => m.hours_allowed >= totalScheduledHours);
        return target ? target.sales_level : "N/A";
    };

    return (
        <div className="space-y-6 relative min-h-[400px]">
            {loading && <LoadingOverlay message="Fetching latest labour data..." />}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Labour Management <p className="text-lg">{now.toDateString()}</p></h1>
                    <p className="text-muted-foreground">Calculate and track labour based on sales performance.</p>
                </div>
                <Button variant="outline" asChild>
                    <a href="/manage/labour/config">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Matrix
                    </a>
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
                    </CardContent>
                </Card>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className={currentGainLoss >= 0 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Current Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${currentGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {currentGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                {currentGainLoss.toFixed(2)} hrs
                            </div>
                            <p className="text-xs text-muted-foreground">Status at ${sales.current || "0"} sales</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Target</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-500" />
                                ${findSalesTarget()}
                            </div>
                            <p className="text-xs text-muted-foreground">To break even with scheduled hours</p>
                        </CardContent>
                    </Card>

                    <Card className={projectedGainLoss >= 0 ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Projected Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${projectedGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {projectedGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                {projectedGainLoss >= 0 ? "+" : ""}{projectedGainLoss.toFixed(2)} hrs
                            </div>
                            <p className="text-xs text-muted-foreground">Gain/Loss based on projection</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Allowed (at Projection)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{projectedAllowed.toFixed(2)} hrs</div>
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
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                            <div>
                                <p className="font-semibold">Total Scheduled</p>
                                <p className="text-sm text-muted-foreground">Based on today&apos;s shifts</p>
                            </div>
                            <div className="text-xl font-bold">
                                {totalScheduledHours.toFixed(2)} hrs
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-border">
                                <p className="text-sm font-semibold mb-1">Impact of Projection</p>
                                <p className="text-xs text-muted-foreground">
                                    Hitting your projection of ${sales.projection || "0"} will {projectedGainLoss >= 0 ? "gain" : "cost"} you {Math.abs(projectedGainLoss).toFixed(2)} hours relative to your current schedule.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border border-border">
                                <p className="text-sm font-semibold mb-1">Team Efficiency</p>
                                <p className="text-xs text-muted-foreground">
                                    You have {shifts.length} people working today. Average shift length: {(totalScheduledHours / (shifts.length || 1)).toFixed(1)} hrs.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LabourManagementPage;
