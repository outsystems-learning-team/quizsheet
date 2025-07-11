import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

const neonSql = neon(process.env.DATABASE_URL!);
export const db = drizzle(neonSql);

export { sql };
