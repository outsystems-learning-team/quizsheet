// frontend/app/api/quiz/route.ts

import { NextResponse } from "next/server";

/**
 * GET ハンドラ：Google Apps Script (GAS) 経由で問題データを取得し、JSON を返却する。
 *
 * - 環境変数 `GAS_SCRIPT_ID` が未定義の場合は 500 エラーを返却
 * - クライアントからのクエリ文字列はそのまま GAS API に転送
 * - GAS API のレスポンスを JSON 形式でクライアントに返却
 *
 * @returns {Promise<NextResponse>} 問題データの JSON レスポンス、もしくはエラーレスポンス
 */
export async function GET(): Promise<NextResponse> {
  // GAS スクリプトの ID を環境変数から取得
  const GAS_SCRIPT_ID = process.env.GAS_SCRIPT_ID;
  if (!GAS_SCRIPT_ID) {
    // 環境変数未設定なら 500 エラーで応答
    return NextResponse.json(
      { error: "GAS_SCRIPT_ID が定義されていません" },
      { status: 500 }
    );
  }

  // クエリ文字列をそのまま GAS に転送するためのエンドポイント URL を構築
  const url = `https://script.google.com/macros/s/${GAS_SCRIPT_ID}/exec`;

  // GAS API に GET リクエストを送信
  const res = await fetch(url);

  // GAS API のステータスをチェック
  if (!res.ok) {
    // エラー発生時はステータスコードとメッセージをクライアントに返却
    return NextResponse.json(
      { error: `GAS API エラー: ${res.status}` },
      { status: res.status }
    );
  }

  // レスポンスボディを JSON としてパース
  const data = await res.json();

  // クライアントに JSON レスポンスを返却
  return NextResponse.json(data);
}
