import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quiz_list } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * GET リクエストを処理し、データベースから問題を取得して返します。
 * @param {NextRequest} req - NextRequest オブジェクト
 * @returns {Promise<NextResponse>} データを格納した NextResponse
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const quizName = searchParams.get("quiz_name");
    const categories = searchParams.get("categories")?.split(",");
    const limit = searchParams.get("limit");

    let query = db.select().from(quiz_list).$dynamic();

    const conditions = [];
    if (quizName) {
      conditions.push(eq(quiz_list.quiz_name, quizName));
    }
    if (categories && categories.length > 0) {
      conditions.push(inArray(quiz_list.category, categories));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const data = await query;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


