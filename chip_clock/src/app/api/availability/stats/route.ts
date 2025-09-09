import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Get total employees count
    const totalEmployeesResult = await client.query(
      'SELECT COUNT(*) as total FROM employee_availability'
    );
    
    // Get available today (Monday) - assuming today is Monday for the example
    // You might want to make this dynamic based on actual day
    const availableTodayResult = await client.query(`
      SELECT COUNT(*) as available 
      FROM employee_availability 
      WHERE monday IS NOT NULL 
        AND monday != '' 
        AND monday != 'A/T' 
        AND monday != 'N/A'
    `);
    
    // Get best covered day
    const bestCoveredDayResult = await client.query(`
      SELECT 
        'Monday' as day, COUNT(*) as coverage
      FROM employee_availability 
      WHERE monday IS NOT NULL AND monday != '' AND monday != 'A/T' AND monday != 'N/A'
      
      UNION ALL
      
      SELECT 
        'Tuesday' as day, COUNT(*) as coverage
      FROM employee_availability 
      WHERE tuesday IS NOT NULL AND tuesday != '' AND tuesday != 'A/T' AND tuesday != 'N/A'
      
      UNION ALL
      
      SELECT 
        'Wednesday' as day, COUNT(*) as coverage
      FROM employee_availability 
      WHERE wednesday IS NOT NULL AND wednesday != '' AND wednesday != 'A/T' AND wednesday != 'N/A'
      
      UNION ALL
      
      SELECT 
        'Thursday' as day, COUNT(*) as coverage
      FROM employee_availability 
      WHERE thursday IS NOT NULL AND thursday != '' AND thursday != 'A/T' AND thursday != 'N/A'
      
      UNION ALL
      
      SELECT 
        'Friday' as day, COUNT(*) as coverage
      FROM employee_availability 
      WHERE friday IS NOT NULL AND friday != '' AND friday != 'A/T' AND friday != 'N/A'
      
      UNION ALL
      
      SELECT 
        'Saturday' as day, COUNT(*) as coverage
      FROM employee_availability 
      WHERE saturday IS NOT NULL AND saturday != '' AND saturday != 'A/T' AND saturday != 'N/A'
      
      UNION ALL
      
      SELECT 
        'Sunday' as day, COUNT(*) as coverage
      FROM employee_availability 
      WHERE sunday IS NOT NULL AND sunday != '' AND sunday != 'A/T' AND sunday != 'N/A'
      
      ORDER BY coverage DESC
      LIMIT 1
    `);
    
    const stats = {
      totalEmployees: parseInt(totalEmployeesResult.rows[0].total),
      availableToday: parseInt(availableTodayResult.rows[0].available),
      bestCoveredDay: bestCoveredDayResult.rows.length > 0 
        ? bestCoveredDayResult.rows[0].day.substring(0, 3)
        : '-'
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  } finally {
    client.release();
  }
}