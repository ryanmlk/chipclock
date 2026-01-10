import prisma from "@/app/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const nameParam = req.nextUrl.searchParams.get("name");
  if (!nameParam) return NextResponse.json([], { status: 400 });

  // Split the name by space and clean up each part
  const names = nameParam
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  // If no valid names after parsing, return 400
  if (names.length === 0) return NextResponse.json([], { status: 400 });

  // Set up query to search for employee schedules by name
  try {
    const scheduleShifts = await prisma.shift.findMany({
      where: {
      employee: {
        OR: [
        {
          first_name: {
          contains: nameParam,
          mode: "insensitive",
          },
        },
        {
          last_name: {
          contains: nameParam,
          mode: "insensitive",
          },
        },
        ],
      },
      shift_start: {
        gte: new Date(),
      }
      },
      include: {
      employee: {
        select: {
        first_name: true,
        last_name: true,
        },
      },
      },
      orderBy: {
      shift_start: "asc",
      },
    });

    return NextResponse.json(scheduleShifts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schedule", details: error },
      { status: 500 }
    );
  }
}
