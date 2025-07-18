import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizName = searchParams.get('quiz_name');
  const categories = searchParams.get('categories');
  const limit = searchParams.get('limit');

  try {
    const conditions = [];
    if (quizName) {
      conditions.push(sql`quiz_name = ${quizName}`);
    }
    if (categories) {
      const categoryArray = categories.split(',');
      if (categoryArray.length > 0) {
        conditions.push(sql`category IN (${sql.join(categoryArray, sql`, `)})`);
      }
    }

    let whereClause = sql``;
    if (conditions.length > 0) {
      whereClause = sql`WHERE ${sql.join(conditions, sql` AND `)}`;
    }

    let query = sql`
      SELECT *
      FROM quiz_list
      ${whereClause}
      ORDER BY id ASC
    `;

    if (limit) {
      query = sql`${query} LIMIT ${parseInt(limit, 10)}`;
    }

    const result = await db.execute(query);
    const quizData: QuizRow[] = result.rows as QuizRow[];

    // ... (rest of the formatting logic remains the same)
    type QuizRow = {
      id: number;
      quiz_name: string;
      category: string;
      question: string;
      choice1: string | null;
      choice2: string | null;
      choice3: string | null;
      choice4: string | null;
      answer: string | number;
      explanation: string;
    };
    const formattedQuizData = quizData.map((row: QuizRow) => {
      const choices = [row.choice1, row.choice2, row.choice3, row.choice4].filter(
        (choice) => typeof choice === 'string' && choice.trim() !== ''
      );
      let answerIndex: number;
      if (typeof row.answer === 'number') {
        answerIndex = row.answer - 1;
      } else if (typeof row.answer === 'string') {
        const parsedAnswer = parseInt(row.answer, 10);
        if (!isNaN(parsedAnswer)) {
          answerIndex = parsedAnswer - 1;
        } else {
          answerIndex = -1;
        }
      } else {
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