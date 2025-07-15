import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { category_list } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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

    // 1. 対象のクイズの全カテゴリを取得
    const allCategoriesQuery = db
      .select({ category: category_list.category_name })
      .from(category_list)
      .where(eq(category_list.quiz_name, quizName))
      .orderBy(category_list.id);

    // 2. ユーザーの回答履歴を取得
    const userAttemptsQuery = db.execute(sql`
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
    `);

    // 2つのクエリを並行して実行
    const [allCategoriesResult, userAttemptsResult] = await Promise.all([
      allCategoriesQuery,
      userAttemptsQuery
    ]);

    // 3. 回答履歴をMapに変換して高速にアクセスできるようにする
    type UserAttemptRow = {
      category: string;
      total_attempts: string | number;
      correct_attempts: string | number;
    };

    const attemptsMap = new Map<string, { total: number; correct: number }>();
    (userAttemptsResult.rows as UserAttemptRow[]).forEach((row) => {
      attemptsMap.set(row.category, {
        total: Number(row.total_attempts),
        correct: Number(row.correct_attempts),
      });
    });

    // 4. 全カテゴリをループし、回答履歴とマージして最終的なデータを作成
    const finalCategoryAccuracy = allCategoriesResult.map((cat) => {
      const stats = attemptsMap.get(cat.category!);
      const accuracy = (stats && stats.total > 0) ? stats.correct / stats.total : 0;
      return {
        category: cat.category,
        accuracy: parseFloat(accuracy.toFixed(2)),
      };
    });

    return NextResponse.json(finalCategoryAccuracy);
  } catch (error) {
    console.error('Error fetching category accuracy:', error);
    return NextResponse.json({ error: 'Failed to fetch category accuracy' }, { status: 500 });
  }
}
