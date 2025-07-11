import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category) {
    return new NextResponse('Category is required', { status: 400 });
  }

  try {
    const result = await db.execute(sql`SELECT * FROM quiz_list WHERE category = ${category}`);
    const quizData = result.rows;
    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
