import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quiz_list, insertQuizListSchema } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { targetSheet, category, question, choices, answer, explanation } = body;

    if (!targetSheet || !category || !question || !choices || !answer || !explanation) {
      return NextResponse.json({ status: 'error', message: 'Missing required fields' }, { status: 400 });
    }

    const [newQuiz] = await db.insert(quiz_list).values(insertQuizListSchema.parse({
      quiz_name: targetSheet,
      category,
      question,
      choice1: choices[0] ?? null,
      choice2: choices[1] ?? null,
      choice3: choices[2] ?? null,
      choice4: choices[3] ?? null,
      answer: answer,
      explanation,
    })).returning();

    return NextResponse.json({ status: 'ok', data: newQuiz });
  } catch (error) {
    console.error('Error in /api/add-quiz:', error);
    return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
