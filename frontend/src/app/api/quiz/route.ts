// frontend/app/api/quiz/route.ts
import { NextResponse, NextRequest } from 'next/server';

/* ------------------------------------------------------------------ */
/* util: 共通レスポンス & GAS 転送                                     */
/* ------------------------------------------------------------------ */

/** GAS スクリプト ID を取得（未設定なら例外） */
const gasId = (): string => {
  const id = process.env.GAS_SCRIPT_ID;
  if (!id) throw new Error('GAS_SCRIPT_ID が定義されていません');
  return id;
};

/** 失敗時にステータス付きで throw するカスタム Error */
class ResponseError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/** GAS API に fetch → JSON を返す（エラー時は ResponseError） */
const callGas = async (init?: RequestInit, query = '') => {
  const url = `https://script.google.com/macros/s/${gasId()}/exec${query}`;
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new ResponseError(res.status, `GAS API Error: ${res.status}`);
  }
  return res.json();
};

/** 例外を NextResponse.json に変換 */
const respond = <T>(data: T | Error) =>
  data instanceof Error
    ? NextResponse.json(
        { error: data.message },
        { status: data instanceof ResponseError ? data.status : 500 },
      )
    : NextResponse.json(data);

/* ------------------------------------------------------------------ */
/* GET                                                                */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const data = await callGas(undefined, req.nextUrl.search); // ?key=...
    return respond(data);
  } catch (err) {
    return respond(err as Error);
  }
}

/* ------------------------------------------------------------------ */
/* POST                                                               */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => {
      throw new ResponseError(400, 'Invalid JSON in request body');
    });

    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    };

    const data = await callGas(init); // POST はクエリ不要
    return respond(data);
  } catch (err) {
    return respond(err as Error);
  }
}
