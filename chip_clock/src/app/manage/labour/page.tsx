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
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, TrendingUp, TrendingDown, Target, Calculator } from "lucide-react";
import { Shift } from "@/generated/prisma";
import { format } from "date-fns";

interface MatrixItem {
    id: string;
    sales_level: number;
    hours_allowed: number;
}

const LabourManagementPage = () => {
    const [matrix, setMatrix] = useState<MatrixItem[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [sales, setSales] = useState({ current: "", projection: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matrixRes, shiftsRes] = await Promise.all([
                    fetch("/api/labour/matrix"),
                    fetch(`/api/schedule?start_date=${new Date().toISOString().split("T")[0]}&end_date=${new Date().toISOString().split("T")[0]}T23:59:59`)
                ]);
                const matrixData = await matrixRes.json();
                setMatrix(Array.isArray(matrixData) ? matrixData : []);
                const shiftsData = await shiftsRes.json();
                setShifts(Array.isArray(shiftsData) ? shiftsData : []);
            } catch (error) {
                console.error("Error fetching labour data:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const totalScheduledHours = shifts.reduce((acc, shift) => acc + parseFloat(shift.hours || "0"), 0);

    const getAllowedHours = (targetSales: number) => {
        if (matrix.length === 0) return 0;
        // Find highest threshold that is <= targetSales
        const sorted = [...matrix].sort((a, b) => b.sales_level - a.sales_level);
        const match = sorted.find(m => m.sales_level <= targetSales);
        return match ? match.hours_allowed : (sorted[sorted.length - 1]?.hours_allowed || 0);
    };

    const currentAllowed = getAllowedHours(parseFloat(sales.current) || 0);
    const projectedAllowed = getAllowedHours(parseFloat(sales.projection) || 0);

    const projectedGainLoss = projectedAllowed - totalScheduledHours;
    const currentGainLoss = currentAllowed - totalScheduledHours;

    // Find sales target to match totalScheduledHours
    const findSalesTarget = () => {
        const sorted = [...matrix].sort((a, b) => a.sales_level - b.sales_level);
        const target = sorted.find(m => m.hours_allowed >= totalScheduledHours);
        return target ? target.sales_level : "N/A";
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Labour Management</h1>
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
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scheduled</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalScheduledHours.toFixed(2)} hrs</div>
                            <p className="text-xs text-muted-foreground">Based on today&apos;s shifts</p>
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
                                <p className="font-semibold">Current Performance</p>
                                <p className="text-sm text-muted-foreground">Status at ${sales.current || "0"} sales</p>
                            </div>
                            <Badge variant={currentGainLoss >= 0 ? "outline" : "destructive"} className={`text-sm px-3 py-1 ${currentGainLoss >= 0 ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}`}>
                                {currentGainLoss.toFixed(2)} hrs
                            </Badge>
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
