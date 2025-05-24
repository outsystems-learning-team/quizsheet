// frontend/app/quiz/page.tsx
"use client";

import { useState } from "react";

export default function QuizPage() {
  // 静的モックデータ
  const q: Question = {
    id: 1,
    category: "クライアント変数",
    question:
      "クライアント変数に使用できるデータ型として正しいものはどれか？",
    choices: [
      "エンティティ型",
      "リストオブテキスト型",
      "バイナリーデータ型",
      "ストラクチャ",
    ],
    answerIndex: 3, // 0ベースに調整（「ストラクチャ」が正解）
    explanation: `正解：ストラクチャ

クライアント変数は、ブラウザ側で一時的なデータの保存に使用され、JSON形式でシリアライズ可能なデータ型のみが許容されます。
ストラクチャは、基本データ型（テキスト、数値、ブール値など）やそれらを組み合わせた構造体であり、シリアライズに適しているため、クライアント変数として使用できます。

不正解選択肢の解説
・エンティティ型
  データベース連携を前提とし、ブラウザでは複雑すぎるため不適。
・リストオブテキスト型
  コレクション型は基本的にサポート外。
・バイナリーデータ型
  JSONにシリアライズできないため不適。`,
  };

  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* カテゴリ */}
      <p className="text-sm text-gray-500 mb-1">{q.category}</p>
      {/* 問題文 */}
      <h2 className="text-xl font-semibold mb-4">{q.question}</h2>

      {/* 選択肢リスト */}
      <ul className="space-y-2 mb-6">
        {q.choices.map((choice, idx) => {
          // 選択済 and 正解・不正解判定用のスタイル
          const isSelected = selected === idx;
          const isCorrect = idx === q.answerIndex;
          let base = "block w-full text-left px-4 py-2 rounded-lg cursor-pointer ";
          if (selected !== null) {
            if (isCorrect) {
              base += "bg-green-100 border border-green-500 text-green-800";
            } else if (isSelected && !isCorrect) {
              base += "bg-red-100 border border-red-500 text-red-800";
            } else {
              base += "bg-gray-100 border border-transparent text-gray-700";
            }
          } else {
            base += "bg-white border border-gray-300 hover:bg-[#fa173d]/10";
          }

          return (
            <li key={idx}>
              <button
                type="button"
                disabled={selected !== null}
                className={base}
                onClick={() => setSelected(idx)}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>

      {/* 解説表示 & ナビゲーションボタン */}
      {selected !== null && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg">
            <h3 className="font-medium mb-2">解説</h3>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm">
              {q.explanation}
            </pre>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              className="px-6 py-2 rounded-lg text-white bg-[#0f0e0b] hover:opacity-90 transition"
            >
              終了
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-lg text-white bg-[#fa173d] hover:opacity-90 transition"
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
