import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { day, value } = body;
    
    // Validate day parameter
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(day)) {
      return NextResponse.json({ error: 'Invalid day parameter' }, { status: 400 });
    }
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE employee_availability 
        SET ${day} = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `, [value || null, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Availability record not found' }, { status: 404 });
      }
      
      // Return the updated record
      const updatedRecord = await client.query(`
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
      `, [id]);
      
      return NextResponse.json(updatedRecord.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error quick editing availability:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}