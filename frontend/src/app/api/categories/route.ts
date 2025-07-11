import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizName = searchParams.get('quiz_name');

  try {
    let result;
    if (quizName) {
      result = await db.execute(sql`SELECT id, category_name FROM category_list WHERE quiz_name = ${quizName} ORDER BY id ASC`);
    } else {
      // quiz_nameが指定されない場合は、すべてのカテゴリを返す（ID昇順）
      result = await db.execute(sql`SELECT id, category_name FROM category_list ORDER BY id ASC`);
    }
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}