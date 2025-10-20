import { NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const quizName = searchParams.get('quiz_name');
  const categories = searchParams.get('categories');
  const limit = searchParams.get('limit');
  // 25-10/17 門田 追加部分 order パラメータの取得
  const order = searchParams.get('order');
  

    try {
      // --- 1. Get all matching IDs ---
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
  
      // 25-10-16 以下 門田 追加部分(ランダム機能の修正)
      // IDの取得
      let idQuery = sql`
        SELECT id 
        FROM quiz_list 
        ${whereClause}
      `;
      
      let idsResult = await db.execute(idQuery);
      let allIds = (idsResult.rows as { id: number }[]).map((row) => row.id);
  
      // 25-10-17 以下 門田 追加部分(allIdsの確認)
      console.log("first allIds:");
      console.log(allIds);
      
      if (allIds.length === 0) {
        return NextResponse.json([]);
      }
  
      // --- 2. Process Ids based on order ---
      let processedIDs = allIds;

      // 'randomが指定されている時のみシャッフルする'
      if (order === 'random'){
        processedIDs = [...allIds].sort(() => Math.random() -0.5);
      }

      console.log("second allIds:");
      console.log(allIds);

      console.log("shuffledIds:");
      console.log(processedIDs);

      let limitNum = limit ? parseInt(limit, 10) : allIds.length;
      let selectedIds = processedIDs.slice(0, limitNum);

      console.log("selected Ids");
      console.log(selectedIds);
  
      if (selectedIds.length === 0) {
        return NextResponse.json([]);
      }
  
      // --- 3. Fetch full data for the selected IDs ---
      // IDと一致する問題のみを取得
      let finalQuery = sql`
        SELECT * 
        FROM quiz_list 
        WHERE id IN (${sql.join(selectedIds,sql`, `)})
      `;
      
      // 追加部分終了

      const result = await db.execute(finalQuery);
      
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
      const quizData: QuizRow[] = result.rows as QuizRow[];
  
      // --- 4. Format the data ---
      const formattedQuizData = quizData.map((row) => {
        const choices = [row.choice1, row.choice2, row.choice3, row.choice4].filter(
          (choice): choice is string => typeof choice === 'string' && choice.trim() !== ''
        );
        let answerIndex: number;
        if (typeof row.answer === 'number') {
          answerIndex = row.answer - 1;
        } else if (typeof row.answer === 'string') {
          const parsedAnswer = parseInt(row.answer, 10);
          answerIndex = !isNaN(parsedAnswer) ? parsedAnswer - 1 : -1;
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
    }}