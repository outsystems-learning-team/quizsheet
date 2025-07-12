import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quiz_list } from '@/lib/schema';
import { eq } from 'drizzle-orm'; // eq をインポート

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizName = searchParams.get('quiz_name');

    const categories = await db.selectDistinct({ category: quiz_list.category })
      .from(quiz_list)
      .where(quizName ? eq(quiz_list.quiz_name, quizName) : undefined)
      .groupBy(quiz_list.category);

    // 各カテゴリに対してダミーの正答率を生成
    const categoryAccuracy = categories.map((item) => {
      const accuracy = Math.random(); // 0.0 から 1.0 のランダムな正答率
      return {
        category: item.category,
        accuracy: parseFloat(accuracy.toFixed(2)), // 小数点以下2桁に丸める
      };
    });

    return NextResponse.json(categoryAccuracy);
  } catch (error) {
    console.error('Error fetching category accuracy:', error);
    return NextResponse.json({ error: 'Failed to fetch category accuracy' }, { status: 500 });
  }
}
