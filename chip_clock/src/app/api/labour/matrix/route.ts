import prisma from "@/app/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const matrix = await prisma.labourMatrix.findMany({
            orderBy: { sales_level: "asc" },
        });
        return NextResponse.json(matrix);
    } catch (error) {
        console.error("Error fetching labour matrix:", error);
        return NextResponse.json({ error: "Failed to fetch matrix" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sales_level, hours_allowed } = body;

        const upserted = await prisma.labourMatrix.upsert({
            where: { sales_level: parseFloat(sales_level) },
            update: { hours_allowed: parseFloat(hours_allowed) },
            create: {
                sales_level: parseFloat(sales_level),
                hours_allowed: parseFloat(hours_allowed),
            },
        });

        return NextResponse.json(upserted);
    } catch (error) {
        console.error("Error upserting labour matrix:", error);
        return NextResponse.json({ error: "Failed to save matrix item" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        await prisma.labourMatrix.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting matrix item:", error);
        return NextResponse.json({ error: "Failed to delete matrix item" }, { status: 500 });
    }
}
