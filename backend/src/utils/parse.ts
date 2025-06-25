/**
 * 安全に JSON 文字列をパースするユーティリティ
 *
 * - 空文字・null・undefined なら即 `null` を返す
 * - 構文エラー時も `null` を返す
 * - 型を指定しない場合は `unknown` が推論される
 *
 * @example
 * const body = parseBody<QuestionsRequest>(e.postData.contents);
 * if (!body) return error("Invalid JSON");
 *
 * @template T 期待する型
 * @param raw  リクエストボディなどの文字列
 * @returns    パース結果 / 失敗時は null
 */
export const parseBody = <T = unknown>(raw: string | null | undefined): T | null => {
  if (!raw?.trim()) return null; // 空文字・null・undefined を弾く

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null; // 構文エラー → null
  }
};
