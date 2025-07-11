import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizName = searchParams.get('quiz_name');
  const categories = searchParams.get('categories'); // categoriesはカンマ区切り文字列を想定

  if (!quizName) {
    return new NextResponse('Quiz name is required', { status: 400 });
  }
  if (!categories) {
    return new NextResponse('Categories are required', { status: 400 });
  }

  try {
    const categoryArray = categories.split(',');
    const result = await db.execute(sql`
      SELECT *
      FROM quiz_list
      WHERE quiz_name = ${quizName}
      AND category IN (${categoryArray})
      ORDER BY id ASC
    `);
    const quizData = result.rows;

    // Question 型に変換
    const formattedQuizData = quizData.map((row: any) => {
      const choices = [row.choice1, row.choice2, row.choice3, row.choice4].filter(
        (choice) => choice !== null && choice !== undefined
      );
      const answerIndex = choices.indexOf(row.answer);

      return {
        id: row.id,
        quizName: row.quiz_name,
        category: row.category,
        question: row.question,
        choices: choices,
        answerIndex: answerIndex,
        explanation: row.explanation,
      };
    });

    return NextResponse.json(formattedQuizData);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}