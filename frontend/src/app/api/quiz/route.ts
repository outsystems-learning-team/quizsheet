import { NextRequest, NextResponse } from "next/server";

/**
 * GAS スクリプト ID を取得（未設定なら例外）
 * @returns {string} GAS スクリプト ID
 * @throws {Error} GAS_SCRIPT_ID が定義されていない場合
 */
const gasId = (): string => {
  const id = process.env.GAS_SCRIPT_ID;
  if (!id) throw new Error("GAS_SCRIPT_ID が定義されていません");
  return id;
};

/**
 * 失敗時にステータス付きで throw するカスタム Error クラス
 */
class ResponseError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * GAS API に fetch し、JSON を返すヘルパー関数
 * エラー時は ResponseError を throw します。
 * @param {RequestInit} [init] - fetch の RequestInit オブジェクト
 * @param {string} [query=''] - クエリ文字列
 * @returns {Promise<any>} GAS API からの JSON レスポンス
 * @throws {ResponseError} GAS API からエラーが返された場合
 */
const callGas = async (init?: RequestInit, query = "") => {
  const url = `https://script.google.com/macros/s/${gasId()}/exec${query}`;
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new ResponseError(res.status, `GAS API Error: ${res.status}`);
  }
  return res.json();
};

/**
 * 例外を NextResponse.json に変換するヘルパー関数
 * @template T - データ型
 * @param {T | Error} data - レスポンスデータまたはエラーオブジェクト
 * @returns {NextResponse} JSON 形式の NextResponse
 */
const respond = <T>(data: T | Error) =>
  data instanceof Error
    ? NextResponse.json(
        { error: data.message },
        { status: data instanceof ResponseError ? data.status : 500 },
      )
    : NextResponse.json(data);

/**
 * GET リクエストを処理し、GAS API からデータを取得して返します。
 * @param {NextRequest} req - NextRequest オブジェクト
 * @returns {Promise<NextResponse>} データを格納した NextResponse
 */
export async function GET(req: NextRequest) {
  try {
    const data = await callGas(undefined, req.nextUrl.search); // ?key=...
    return respond(data);
  } catch (err) {
    return respond(err as Error);
  }
}

/**
 * POST リクエストを処理し、リクエストボディを GAS API に転送して結果を返します。
 * @param {NextRequest} req - NextRequest オブジェクト
 * @returns {Promise<NextResponse>} データを格納した NextResponse
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => {
      throw new ResponseError(400, "Invalid JSON in request body");
    });

    const init: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };

    const data = await callGas(init); // POST はクエリ不要
    return respond(data);
  } catch (err) {
    return respond(err as Error);
  }
}
