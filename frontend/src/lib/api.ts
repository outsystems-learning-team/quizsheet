/**
 * quiz API から問題一覧を取得する非同期関数。
 *
 * @returns {Promise<Question[]>} 取得した問題データの配列を持つ Promise。
 * @throws {Error} HTTP ステータスが OK 以外の場合に、ステータスコードを含むエラーメッセージを投げる。
 */
export async function fetchQuestions(): Promise<Question[]> {
  // /api/quiz エンドポイントへ GET リクエストを送信
  const res = await fetch(`/api/quiz`);

  // レスポンスの HTTP ステータスをチェック
  if (!res.ok) {
    // ステータスが 200 系でない場合はエラーをスロー
    throw new Error(`問題データの取得に失敗しました: ${res.status}`);
  }

  // レスポンスボディを JSON としてパース
  // 戻り値は { questions: Question[] } 形式を期待
  const json = (await res.json()) as { questions: Question[] };

  // パースしたオブジェクトから questions 配列を抽出して返却
  return json.questions;
}
