import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT DISTINCT category_name FROM category_list`);
    const categories = result.rows.map((row: any) => row.category_name);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
