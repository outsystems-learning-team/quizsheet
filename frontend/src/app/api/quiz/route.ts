// frontend/app/api/quiz/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const GAS_SCRIPT_ID = process.env.GAS_SCRIPT_ID;
  if (!GAS_SCRIPT_ID) {
    return NextResponse.json(
      { error: "GAS_SCRIPT_ID が定義されていません" },
      { status: 500 }
    );
  }

  // リクエストのクエリ文字列をそのまま GAS に転送
  const url = `https://script.google.com/macros/s/${GAS_SCRIPT_ID}/exec`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `GAS API エラー: ${res.status}` },
      { status: res.status }
    );
  }
  const data = await res.json();
  return NextResponse.json(data);
}
