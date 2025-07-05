import { QuestionsRequest } from "../../../shared/types";

type ApiResponse<Success> =
  | { status: "ok"; data: Success }
  | { status: "error"; message: string };

/**
 * GAS 転送 API（/api/quiz）を叩いて JSON を返す共通ヘルパー関数
 * @template T - API レスポンスの型
 * @param {QuestionsRequest} body - リクエストボディ
 * @returns {Promise<T>} API レスポンスデータ
 * @throws {Error} API からエラーが返された場合
 */
export async function fetchQuizApi<T>(body: QuestionsRequest): Promise<T> {
  const res = await fetch("/api/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json: ApiResponse<T> = await res.json();

  if (json.status !== "ok") throw new Error(json.message);
  return json.data;
}
