"use client";

import type { FC } from "react";

export interface QuestionFooterProps {
  /** 当該問題の解説テキスト */
  explanation: string;
  /** 「次へ」押下時に呼ばれる関数 */
  onNext: () => void;
  /** 「終了」押下時に呼ばれる関数 */
  onFinish: () => void;
}

/**
 * 回答後に表示する解説と「次へ」「終了」ボタンをまとめたコンポーネント
 *
 * @param props.explanation 解説文
 * @param props.onNext 次の問題へ進むハンドラ
 * @param props.onFinish クイズを終了するハンドラ
 * @returns JSX.Element
 */
export const QuestionFooter: FC<QuestionFooterProps> = ({
  explanation,
  onNext,
  onFinish,
}) => {
  return (
    <div className="space-y-4 max-w-2xl mx-auto p-6">
      {/* 操作ボタン */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onFinish}
          className="px-6 py-2 rounded-lg text-white bg-[#0f0e0b] hover:opacity-90 transition"
        >
          終了
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 rounded-lg text-white bg-[#fa173d] hover:opacity-90 transition"
        >
          次へ
        </button>
      </div>
      {/* 解説表示エリア */}
      <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg">
        <h3 className="font-medium mb-2">解説</h3>
        <pre className="whitespace-pre-wrap text-gray-800 text-sm">
          {explanation}
        </pre>
      </div>
    </div>
  );
};
