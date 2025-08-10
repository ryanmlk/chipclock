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
  const names = nameParam
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  // If no valid names after parsing, return 400
  if (names.length === 0) return NextResponse.json([], { status: 400 });

  // Create ILIKE conditions for each name part
  const nameConditions = names
    .map((_, index) => `e.name ILIKE $${index + 1}`)
    .join(" OR ");
  // Create parameters array with wildcard for each name
  const name = names.map((name) => `%${name}%`);
  if (!name) return NextResponse.json([], { status: 400 });

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT s.week_start_date,SUM(CAST(hours AS numeric)) AS total_hours
        FROM schedule_shifts s
        WHERE s.employee_id = (
          SELECT e.id FROM employees e WHERE ${nameConditions}
        )
        GROUP BY week_start_date
        ORDER BY week_start_date DESC
        LIMIT 10`,
      [...name]
    );
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
