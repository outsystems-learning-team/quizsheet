import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT DISTINCT quiz_name_jp FROM quiz_name_list`);
    const quizNames = result.rows.map((row: any) => row.quiz_name_jp);
    return NextResponse.json(quizNames);
  } catch (error) {
    console.error('Error fetching quiz names:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
