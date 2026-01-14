import prisma from "@/app/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const startDate = req.nextUrl.searchParams.get("start_date");
  const endDate = req.nextUrl.searchParams.get("end_date");
  const nameParam = req.nextUrl.searchParams.get("name");

  // Calculate start of current week (Monday)
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const currentWeekStart = new Date(now.setDate(diff));
  currentWeekStart.setHours(0, 0, 0, 0);

  let effectiveStartDate = startDate ? new Date(startDate) : currentWeekStart;

  // Enforce "current week onwards" rule
  if (effectiveStartDate < currentWeekStart) {
    effectiveStartDate = currentWeekStart;
  }

  try {
    const shifts = await prisma.shift.findMany({
      where: {
        ...(endDate ? {
          shift_start: {
            gte: effectiveStartDate,
            lte: new Date(endDate),
          }
        } : {
          shift_start: {
            gte: effectiveStartDate,
          }
        }),
        ...(nameParam ? {
          employee: {
            OR: [
              { first_name: { contains: nameParam, mode: "insensitive" } },
              { last_name: { contains: nameParam, mode: "insensitive" } },
            ],
          }
        } : {}),
      },
      include: {
        employee: true,
      },
      orderBy: {
        shift_start: "asc",
      },
    });

    return NextResponse.json(shifts, { status: 200 });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { schedule_id } = body;
    const { shift_start } = body;

    if (!schedule_id && shift_start) {
      const startDate = new Date(shift_start);
      // Find the Monday of that week
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(startDate.setDate(diff));
      monday.setHours(0, 0, 0, 0);

      let schedule = await prisma.weeklySchedule.findFirst({
        where: { week_start_date: monday },
      });

      if (!schedule) {
        schedule = await prisma.weeklySchedule.create({
          data: {
            week_start_date: monday,
            published: true, // Auto-publish for manual edits?
          },
        });
      }
      schedule_id = schedule.id;
    }

    const newShift = await prisma.shift.create({
      data: {
        schedule_id: schedule_id,
        employee_id: body.employee_id,
        shift_start: new Date(body.shift_start),
        shift_end: new Date(body.shift_end),
        position: body.position,
        hours: body.hours,
      },
      include: { employee: true },
    });
    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const updatedShift = await prisma.shift.update({
      where: { id },
      data: {
        ...data,
        shift_start: data.shift_start ? new Date(data.shift_start) : undefined,
        shift_end: data.shift_end ? new Date(data.shift_end) : undefined,
      },
      include: { employee: true },
    });
    return NextResponse.json(updatedShift);
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json({ error: "Failed to update shift" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.shift.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 });
  }
}
