import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json([], { status: 400 });

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT s.id, e.name, s.shift_date, s.start_time, s.end_time, s.shift_type, s.hours
        FROM schedule_shifts s
        JOIN employees e ON s.employee_id = e.id
        WHERE e.name ILIKE $1
            AND s.shift_date >= CURRENT_DATE
            AND s.shift_date < CURRENT_DATE + INTERVAL '7 days'
        ORDER BY s.shift_date, s.start_time`,
      [`%${name}%`]
    );
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
