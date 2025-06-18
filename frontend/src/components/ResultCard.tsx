// src/components/ResultCard.tsx
"use client";

import type { FC } from "react";

export interface ResultCardProps {
  answered: number;
  correct: number;
  streak: number;
  categoryStats: Record<string, { total: number; correct: number }>;
  onRestart?: () => void;
}

export const ResultCard: FC<ResultCardProps> = ({
  answered,
  correct,
  streak,
  categoryStats,
  onRestart,
}) => {
  const rate = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    //<div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl">
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#fa173d]">
        回答結果
      </h2>

      {/* 統計表示 */}
      <div className="grid grid-cols-2 gap-4 text-center mb-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">回答数</p>
          <p className="text-xl font-bold">{answered}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">正答数</p>
          <p className="text-xl font-bold">{correct}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">正答率</p>
          <p className="text-xl font-bold">{rate}%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">連続正解</p>
          <p className="text-xl font-bold">{streak}</p>
        </div>
      </div>

      {/* カテゴリ別 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">カテゴリ別成績</h3>
        <ul className="space-y-2">
          {Object.entries(categoryStats).map(([category, stat]) => (
            <li
              key={category}
              className="flex justify-between bg-gray-50 px-4 py-2 rounded-md shadow-sm"
            >
              <span className="font-medium">{category}</span>
              <span>
                {stat.correct} / {stat.total}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 戻るボタン */}
      {onRestart && (
        <div className="text-center mt-6">
          <button
            onClick={onRestart}
            className="bg-[#fa173d] hover:bg-[#e31535] text-white px-6 py-3 rounded-lg transition"
          >
            スタートページに戻る
          </button>
        </div>
      )}
    </div>
  );
};