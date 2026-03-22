"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface MatrixItem {
    id: string;
    sales_level: number;
    hours_allowed: number;
}

const LabourConfigPage = () => {
    const [matrix, setMatrix] = useState<MatrixItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ sales_level: "", hours_allowed: "" });

    const fetchMatrix = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/labour/matrix");
            const data = await res.json();
            setMatrix(data);
        } catch (error) {
            console.error("Error fetching matrix:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMatrix();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.sales_level || !newItem.hours_allowed) return;

        try {
            await fetch("/api/labour/matrix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
            });
            setNewItem({ sales_level: "", hours_allowed: "" });
            fetchMatrix();
        } catch (error) {
            console.error("Error saving matrix item:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch("/api/labour/matrix", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            fetchMatrix();
        } catch (error) {
            console.error("Error deleting matrix item:", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Labour Matrix Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="flex items-end gap-4 mb-6">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="sales">Sales Threshold ($)</Label>
                            <Input
                                id="sales"
                                type="number"
                                placeholder="e.g. 5000"
                                value={newItem.sales_level}
                                onChange={(e) => setNewItem({ ...newItem, sales_level: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="hours">Hours Allowed</Label>
                            <Input
                                id="hours"
                                type="number"
                                step="0.1"
                                placeholder="e.g. 45.5"
                                value={newItem.hours_allowed}
                                onChange={(e) => setNewItem({ ...newItem, hours_allowed: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Row
                        </Button>
                    </form>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sales Level ($)</TableHead>
                                <TableHead>Hours Allowed</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matrix.slice().sort((a,b) => a.sales_level - b.sales_level).map((item, index, sortedArr) => {
                                const lowerLimit = index === 0 ? 0 : sortedArr[index - 1].sales_level + 1;
                                return (
                                <TableRow key={item.id}>
                                    <TableCell>${lowerLimit.toLocaleString()} to ${item.sales_level.toLocaleString()}</TableCell>
                                    <TableCell>{item.hours_allowed} hrs</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                            {matrix.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No matrix data yet. Add some thresholds above.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button variant="outline" asChild>
                    <a href="/manage/labour">Back to Calculator</a>
                </Button>
            </div>
        </div>
    );
};

export default LabourConfigPage;
