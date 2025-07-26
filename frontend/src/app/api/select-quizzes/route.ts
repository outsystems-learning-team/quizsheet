import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET(request: Request) {

  // urlからそれぞれのパラメータを取得
  const { searchParams } = new URL(request.url);
  const quizName = searchParams.get('quiz_name');
  const categories = searchParams.get('categories'); // categoriesはカンマ区切り文字列を想定

  if (!quizName) {
    return new NextResponse('Quiz name is required', { status: 400 });
  }

  try {
    // メインのクエリ
    let query = sql`
      SELECT *
      FROM quiz_list
      WHERE quiz_name = ${quizName}
    `;

    // カテゴリー指定
    if (categories) {
      console.log('Received categories:', categories);

      const categoryArray = categories.split(',');
      console.log('categoryArray:', categoryArray);

      query = sql`${query} AND category IN (${sql.join(categoryArray, sql`, `)})`;
    }

    // カテゴリー順にソート
    query = sql`${query} ORDER BY category ASC, id ASC`;

    const result = await db.execute(query);
    const quizData: QuizRow[] = result.rows as QuizRow[];

    // Question 型に変換
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
        // answer が数値の場合、それを直接インデックスとして使用 (1始まりを想定し、0始まりに変換)
        answerIndex = row.answer - 1;
      } else if (typeof row.answer === 'string') {
        // answer が文字列の場合、数値に変換してインデックスを探す
        const parsedAnswer = parseInt(row.answer, 10);
        if (!isNaN(parsedAnswer)) {
          answerIndex = parsedAnswer - 1;
        } else {
          // 数値に変換できない場合は、不正な値として -1 を設定
          answerIndex = -1;
        }
        console.log(`Quiz ID: ${row.id}, category: '${row.category}', Choices: [${choices.map(c => `'${c}'`).join(', ')}], Calculated answerIndex: ${answerIndex}`);        
      } else {
        // その他の型の場合は -1 (不正な値)
        answerIndex = -1;
        console.log(`Quiz ID: ${row.id}, category: '${row.category}', Choices: [${choices.map(c => `'${c}'`).join(', ')}], Calculated answerIndex: ${answerIndex}`);        
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