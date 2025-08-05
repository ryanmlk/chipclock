import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(req: NextRequest) {
  const nameParam = req.nextUrl.searchParams.get("name");
  if (!nameParam) return NextResponse.json([], { status: 400 });
  
  // Split the name by space and clean up each part
  const names = nameParam.split(' ')
    .map(part => part.trim())
    .filter(part => part.length > 0);
  
  // If no valid names after parsing, return 400
  if (names.length === 0) return NextResponse.json([], { status: 400 });
  
  // Create ILIKE conditions for each name part
  const nameConditions = names.map((_, index) => `e.name ILIKE $${index + 1}`).join(' OR ');
  // Create parameters array with wildcard for each name
  const name = names.map(name => `%${name}%`);
  if (!name) return NextResponse.json([], { status: 400 });

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT s.id, e.name, s.shift_date, s.start_time, s.end_time, s.shift_type, s.hours
        FROM schedule_shifts s
        JOIN employees e ON s.employee_id = e.id
        WHERE (${nameConditions})
            AND s.shift_date >= CURRENT_DATE
            AND s.shift_date < CURRENT_DATE + INTERVAL '7 days'
        ORDER BY s.shift_date, s.start_time`,
      [...name]
    );
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
