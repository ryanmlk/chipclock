import prisma from "@/app/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  let employees;

  if (q === "") {
    // return all employees (maybe with a limit or pagination)
    employees = await prisma.employee.findMany();
  } else {
    employees = await prisma.employee.findMany({
      where: {
        OR: [
          {
            first_name: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            last_name: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
      select: { id: true, first_name: true, last_name: true },
      take: 10,
    });
  }

  return NextResponse.json(employees);
}

// POST: Create a new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create the employee in the database
    const newEmployee = await prisma.employee.create({
      data: {
        chipotle_id: body.chipotle_id,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        hire_date: body.hire_date,
        status: body.status,
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create employee", details: error },
      { status: 500 }
    );
  }
}

// PATCH: Update an employee with partial data
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Update the employee in the database
    const updatedEmployee = await prisma.employee.update({
      where: { id: body.id },
      data: body,
    });

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update employee", details: error },
      { status: 500 }
    );
  }
}
