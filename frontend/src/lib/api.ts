// src/lib/api.ts
/**
 * Next.js API Route 経由で問題データを取得します。
 * @returns Question[] の Promise
 */
export async function fetchQuestions(): Promise<Question[]> {

  const res = await fetch(`/api/quiz`);
  if (!res.ok) {
    throw new Error(`問題データの取得に失敗しました: ${res.status}`);
  }
  const json = (await res.json()) as { questions: Question[] };
  return json.questions;
}