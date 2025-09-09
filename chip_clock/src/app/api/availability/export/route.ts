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
    
    // Generate CSV content
    const headers = [
      'Name', 'Job Type', 'Monday', 'Tuesday', 'Wednesday', 
      'Thursday', 'Friday', 'Saturday', 'Sunday', 'Days/Hr', 'Effective Date'
    ];
    
    const csvContent = [
      headers.join(','),
      ...result.rows.map(row => [
        `"${row.name}"`,
        `"${row.job_type}"`,
        `"${row.monday || ''}"`,
        `"${row.tuesday || ''}"`,
        `"${row.wednesday || ''}"`,
        `"${row.thursday || ''}"`,
        `"${row.friday || ''}"`,
        `"${row.saturday || ''}"`,
        `"${row.sunday || ''}"`,
        `"${row.days_hr || ''}"`,
        `"${row.effective_date ? new Date(row.effective_date).toLocaleDateString() : ''}"`
      ].join(','))
    ].join('\n');
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=chipotle_availability.csv',
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  } finally {
    client.release();
  }
}