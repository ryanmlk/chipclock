import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(req: NextRequest) {
  const jobType = req.nextUrl.searchParams.get("jobType");
  const employeeName = req.nextUrl.searchParams.get("employeeName");
  
  const client = await pool.connect();
  try {
    let query = `
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
      WHERE 1=1
    `;
    
    const params: unknown[] = [];
    
    if (jobType && jobType !== 'all') {
      query += ` AND ea.job_type = $${params.length + 1}`;
      params.push(jobType);
    }
    
    if (employeeName) {
      query += ` AND e.name ILIKE $${params.length + 1}`;
      params.push(`%${employeeName}%`);
    }
    
    query += ` ORDER BY e.name`;
    
    const result = await client.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  try {
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
      effectiveDate
    } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First, insert or get the employee
      const employeeResult = await client.query(
        'SELECT id FROM employees WHERE name = $1',
        [name]
      );
      
      let employeeId;
      if (employeeResult.rows.length === 0) {
        // Insert new employee
        const newEmployeeResult = await client.query(
          'INSERT INTO employees (name, email) VALUES ($1, $2) RETURNING id',
          [name, email || null]
        );
        employeeId = newEmployeeResult.rows[0].id;
      } else {
        employeeId = employeeResult.rows[0].id;
      }
      
      // Insert availability record
      const availabilityResult = await client.query(`
        INSERT INTO employee_availability 
        (employee_id, job_type, monday, tuesday, wednesday, thursday, friday, saturday, sunday, days_hr, effective_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [employeeId, jobType, monday || null, tuesday || null, wednesday || null, 
          thursday || null, friday || null, saturday || null, sunday || null, 
          daysHr, effectiveDate]);
      
      await client.query('COMMIT');
      
      // Return the complete record
      const result = await client.query(`
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
      `, [availabilityResult.rows[0].id]);
      
      return NextResponse.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating availability:', error);
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 });
  }
}