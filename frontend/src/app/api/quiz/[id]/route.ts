import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';
import { z } from 'zod';

// Zodスキーマを定義してリクエストボディを検証
const quizUpdateSchema = z.object({
  category: z.string().min(1),
  question: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).max(4),
  answerIndex: z.number().min(0).max(3),
  explanation: z.string().optional(),
});

// PUT: 問題を更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quizId = parseInt(params.id, 10);
  if (isNaN(quizId)) {
    return new NextResponse('Invalid quiz ID', { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = quizUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.errors), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { category, question, choices, answerIndex, explanation } = validation.data;

    // DBのanswerは1-indexedなので+1する
    const answer = answerIndex + 1;

    const result = await db.execute(sql`
      UPDATE quiz_list
      SET
        category = ${category},
        question = ${question},
        choice1 = ${choices[0] ?? null},
        choice2 = ${choices[1] ?? null},
        choice3 = ${choices[2] ?? null},
        choice4 = ${choices[3] ?? null},
        answer = ${answer},
        explanation = ${explanation ?? ''}
      WHERE id = ${quizId}
    `);

    if (result.rowsAffected === 0) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    return NextResponse.json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE: 問題を削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quizId = parseInt(params.id, 10);
  if (isNaN(quizId)) {
    return new NextResponse('Invalid quiz ID', { status: 400 });
  }

  try {
    const result = await db.execute(sql`
      DELETE FROM quiz_list
      WHERE id = ${quizId}
    `);

    if (result.rowsAffected === 0) {
      return new NextResponse('Quiz not found', { status: 404 });
    }

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
