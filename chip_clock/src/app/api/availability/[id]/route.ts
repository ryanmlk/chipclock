import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      email,
      jobType,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      daysHr,
      effectiveDate,
    } = body;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get the current employee_id
      const currentRecord = await client.query(
        "SELECT employee_id FROM employee_availability WHERE id = $1",
        [id]
      );

      if (currentRecord.rows.length === 0) {
        return NextResponse.json(
          { error: "Availability record not found" },
          { status: 404 }
        );
      }

      const employeeId = currentRecord.rows[0].employee_id;

      // Update employee info
      await client.query(
        "UPDATE employees SET name = $1, email = $2 WHERE id = $3",
        [name, email || null, employeeId]
      );

      // Update availability record
      await client.query(
        `
        UPDATE employee_availability 
        SET job_type = $1, monday = $2, tuesday = $3, wednesday = $4, 
            thursday = $5, friday = $6, saturday = $7, sunday = $8, 
            days_hr = $9, effective_date = $10, updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
      `,
        [
          jobType,
          monday || null,
          tuesday || null,
          wednesday || null,
          thursday || null,
          friday || null,
          saturday || null,
          sunday || null,
          daysHr,
          effectiveDate,
          id,
        ]
      );

      await client.query("COMMIT");

      // Return the updated record
      const result = await client.query(
        `
        SELECT 
          ea.id,
          e.name,
          ea.job_type,
          ea.monday,
          ea.tuesday,
          ea.wednesday,
          ea.thursday,
          ea.friday,
          ea.saturday,
          ea.sunday,
          ea.days_hr,
          ea.effective_date
        FROM employee_availability ea
        JOIN employees e ON ea.employee_id = e.id
        WHERE ea.id = $1
      `,
        [id]
      );

      return NextResponse.json(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await pool.connect();

    try {
      const result = await client.query(
        "DELETE FROM employee_availability WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Availability record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Availability record deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
