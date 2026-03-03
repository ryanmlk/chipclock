import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from 'pg';

const connectionString = `postgresql://neondb_owner:npg_gA9DdCBhr3IU@ep-morning-tooth-ai5zfy9t.c-4.us-east-1.aws.neon.tech:5432/chipclock_test`;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
    const shifts = await prisma.shift.findMany({
        orderBy: { shift_start: 'desc' },
        take: 1
    });
    const oldest = await prisma.shift.findMany({
        orderBy: { shift_start: 'asc' },
        take: 1
    });
    console.log("Total shifts in DB:", shifts.length);
    if (shifts.length > 0) {
        console.log("Newest shift date:", shifts[0].shift_start);
        console.log("Oldest shift date:", oldest[0].shift_start);
    }
}
test();