import prisma from "@/app/prisma";
import { AvailabilitySlot } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const position = req.nextUrl.searchParams.get("position");
  const employee_id = req.nextUrl.searchParams.get("employee_id");

  try {
    const availabilities = await prisma.availabilitySlot.findMany({
      where: {
        ...(position && position !== "all"
          ? { employee: { positions: { has: position } } }
          : {}),
        ...(employee_id
          ? { employee: { id: employee_id } }
          : {}),
      },
      include: {
        employee: true,
      },
      orderBy: {
        employee: { first_name: "asc" },
      },
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Handle both single object and array of objects
    const availabilitySlots: AvailabilitySlot[] = Array.isArray(body) ? body : [body];

    // Create all availability slots in a single transaction
    const createdSlots = await prisma.availabilitySlot.createMany({
      data: availabilitySlots.map(slot => ({
        employee_id: slot.employee_id,
        day_of_week: slot.day_of_week,
        start_time: new Date(slot.start_time),
        end_time: new Date(slot.end_time),
        start_date: slot.start_date ? new Date(slot.start_date) : null,
        end_date: slot.end_date ? new Date(slot.end_date) : null
      })),
    });

    return NextResponse.json({ success: true, count: createdSlots.count });
  } catch (error) {
    console.error("Error creating availability:", error);
    return NextResponse.json({ error: "Failed to create availability" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const employee_id = req.nextUrl.searchParams.get("employee_id");
  const start_date = req.nextUrl.searchParams.get("start_date");

  if (!employee_id || !start_date) {
    return NextResponse.json({ error: "Missing employee_id or start_date" }, { status: 400 });
  }

  try {
    const deleted = await prisma.availabilitySlot.deleteMany({
      where: {
        employee_id: employee_id,
        start_date: new Date(start_date),
      },
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    console.error("Error deleting availability group:", error);
    return NextResponse.json({ error: "Failed to delete availability group" }, { status: 500 });
  }
}