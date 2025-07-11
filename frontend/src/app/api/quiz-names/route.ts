import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT id, quiz_name, quiz_name_jp FROM quiz_name_list ORDER BY id ASC`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching quiz names:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
