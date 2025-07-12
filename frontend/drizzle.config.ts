import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  
  dialect: 'postgresql', // または 'pg'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};