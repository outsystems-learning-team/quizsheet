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
        (choice) => typeof choice === 'string' && choice.trim() !== ''
      );
      let answerIndex: number;
      if (typeof row.answer === 'number') {
        // answer が数値の場合、それを直接インデックスとして使用 (1始まりを想定し、0始まりに変換)
        answerIndex = row.answer - 1;
      } else if (typeof row.answer === 'string') {
        // answer が文字列の場合、文字列比較でインデックスを探す
        answerIndex = choices.findIndex(
          (choice) =>
            typeof choice === 'string' &&
            choice.trim().toLowerCase() === row.answer.trim().toLowerCase()
        );
      } else {
        // その他の型の場合は -1 (不正な値)
        answerIndex = -1;
      }

      

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