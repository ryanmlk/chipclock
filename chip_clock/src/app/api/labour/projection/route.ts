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
        const kpis = await prisma.dailyKPI.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });

        const result: Record<string, any> = {};
        kpis.forEach(kpi => {
            result[kpi.kpi_name] = kpi.kpi_value;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching sales projection:", error);
        return NextResponse.json({ error: "Failed to fetch sales projection" }, { status: 500 });
    }
}
