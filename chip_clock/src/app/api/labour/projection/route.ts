import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const date = new Date(dateStr);
    const start = startOfDay(date);
    const end = endOfDay(date);

    try {
        const kpi = await prisma.dailyKPI.findFirst({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
                kpi_name: "sales_projection",
            },
        });

        if (!kpi) {
            return NextResponse.json({ sales_projection: 0 });
        }

        return NextResponse.json({
            sales_projection: kpi.kpi_value,
            date: kpi.date,
        });
    } catch (error) {
        console.error("Error fetching sales projection:", error);
        return NextResponse.json({ error: "Failed to fetch sales projection" }, { status: 500 });
    }
}
