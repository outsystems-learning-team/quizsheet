import {QuestionsRequest} from "../../../shared/types"
/* utils/fetchQuizApi.ts ------------------------------------------- */
type ApiResponse<Success> =
  | { status: 'ok'; data: Success }
  | { status: 'error'; message: string };

/** GAS 転送 API（/api/quiz）を叩いて JSON を返す共通ヘルパー */
export async function fetchQuizApi<T>(body: QuestionsRequest): Promise<T> {
  const res = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json: ApiResponse<T> = await res.json();

  if (json.status !== 'ok') throw new Error(json.message);
  return json.data;
}
