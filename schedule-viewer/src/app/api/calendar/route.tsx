import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { generateICS } from "@/lib/generateICS";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(
    req: NextRequest
  ) {
    const name = req.nextUrl.searchParams.get("name");
    if (!name) return NextResponse.json([], { status: 400 });

    const client = await pool.connect();
  
    try {
      const { rows } = await client.query(
        `SELECT e.name, s.shift_date, s.start_time, s.end_time, s.shift_type, s.hours
          FROM schedule_shifts s
          JOIN employees e ON s.employee_id = e.id
          WHERE e.name ILIKE $1
          ORDER BY s.shift_date, s.start_time`,
        [`%${name}%`]
      );
  
      if (rows.length === 0) {
        return new NextResponse("No shifts found", { status: 404 });
      }
  
      const icsContent = generateICS(name, rows);
  
      return new NextResponse(icsContent, {
        status: 200,
        headers: {
          "Content-Type": "text/calendar",
          "Content-Disposition": `attachment; filename="${name}.ics"`,
        },
      });
    } finally {
      client.release();
    }
  }
