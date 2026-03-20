import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/prisma";
import { startOfDay } from "date-fns";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, sales_projection, actual_sales, actual_hours } = body;

        if (!date) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const targetDate = new Date(date);
        const start = startOfDay(targetDate);


        // Find the weekly schedule for this date
        const weeklySchedule = await prisma.weeklySchedule.findFirst({
            where: {
                week_start_date: {
                    lte: start,
                },
            },
            orderBy: {
                week_start_date: "desc",
            },
        });

        if (!weeklySchedule) {
            return NextResponse.json({ error: "No weekly schedule found for this date" }, { status: 404 });
        }

        const kpis = [
            { name: "sales_projection", value: sales_projection },
            { name: "actual_sales", value: actual_sales },
            { name: "actual_hours", value: actual_hours },
        ];

        for (const kpi of kpis) {
            if (kpi.value === undefined || kpi.value === null || kpi.value === "") continue;

            const val = typeof kpi.value === "string" ? parseFloat(kpi.value) : kpi.value;

            await prisma.dailyKPI.upsert({
                where: {
                    date_kpi_name: {
                        date: targetDate,
                        kpi_name: kpi.name,
                    },
                },
                update: {
                    kpi_value: val,
                },
                create: {
                    weekly_schedule_id: weeklySchedule.id,
                    date: targetDate,
                    kpi_value: val,
                    kpi_name: kpi.name,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving daily KPIs:", error);
        return NextResponse.json({ error: "Failed to save daily KPIs" }, { status: 500 });
    }
}
