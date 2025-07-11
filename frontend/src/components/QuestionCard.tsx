"use client";

import type { FC } from "react";
import { Question } from "@shared/types";

export interface QuestionCardProps {
  /** 表示する問題オブジェクト */
  question: Question;
  /** 現在選択中の選択肢インデックス、未選択時は null */
  selected: number | null;
  /** 選択肢を選んだときに呼ばれるコールバック */
  onSelect: (idx: number) => void;
}

/**
 * 1問分の問題文と選択肢・選択状態を表示するコンポーネント
 *
 * @param {Question} props.question - 表示対象の Question オブジェクト
 * @param {number | null} props.selected - 現在選択されているインデックス
 * @param {(idx: number) => void} props.onSelect - 選択時に呼び出される関数
 * @returns {JSX.Element} 問題カードの UI 要素
 */
export const QuestionCard: FC<QuestionCardProps> = ({
  question,
  selected,
  onSelect,
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* カテゴリ名 */}
      <p className="text-sm mb-1">{question.category}</p>
      {/* 問題文 */}
      <h2 className="text-xl font-semibold mb-4">{question.question}</h2>

      {/* 選択肢リスト */}
      <ul className="space-y-2 mb-6">
        {question.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === question.answerIndex;

          // ボタンのベースクラス
          let base =
            "block w-full text-left px-4 py-2 rounded-lg cursor-pointer ";
          if (selected !== null) {
            // 回答済み：正誤によってスタイルを変更
            if (isCorrect) {
              base += "bg-green-100 border border-green-500 text-green-800";
            } else if (isSelected) {
              base += "bg-red-100 border border-red-500 text-red-800";
            } else {
              base += "bg-primary-bg border border-transparent";
            }
          } else {
            // 未回答：通常状態
            base += "bg-primary-bg border border-border-color hover:bg-[#fa173d]/10";
          }

          return (
            <li key={idx}>
              <button
                type="button"
                disabled={selected !== null}
                className={base}
                onClick={() => onSelect(idx)}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
