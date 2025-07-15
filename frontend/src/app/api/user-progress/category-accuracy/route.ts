import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; 

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { searchParams } = new URL(request.url);
    const quizName = searchParams.get('quiz_name');

    if (!quizName) {
      return new NextResponse('Quiz name is required', { status: 400 });
    }

    const query = sql`
      SELECT
        ql.category,
        COUNT(uqa.id) AS total_attempts,
        SUM(CASE WHEN uqa.is_correct THEN 1 ELSE 0 END)::int AS correct_attempts
      FROM
        user_quiz_attempts AS uqa
      JOIN
        quiz_list AS ql ON uqa.quiz_question_id = ql.id
      WHERE
        uqa.user_id = ${userId} AND ql.quiz_name = ${quizName}
      GROUP BY
        ql.category;
    `;

    const result = await db.execute(query);
    
    type ResultRow = {
      category: string;
      total_attempts: string | number;
      correct_attempts: string | number;
    };

    const categoryAccuracy = (result.rows as ResultRow[]).map((row: ResultRow) => {
      const totalAttempts = Number(row.total_attempts);
      const correctAttempts = Number(row.correct_attempts);
      const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
      return {
        category: row.category,
        accuracy: parseFloat(accuracy.toFixed(2)),
      };
    });

    return NextResponse.json(categoryAccuracy);
  } catch (error) {
    console.error('Error fetching category accuracy:', error);
    return NextResponse.json({ error: 'Failed to fetch category accuracy' }, { status: 500 });
  }
}
