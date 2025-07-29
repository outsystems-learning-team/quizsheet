"use client";

import type { FC, ReactNode } from "react";
import { useState } from "react";
import { Question } from "@shared/types";

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  isChecked: boolean;
  onCheckboxChange: () => void;
}

const AccordionItem: FC<AccordionItemProps> = ({ title, children, isChecked, onCheckboxChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onCheckboxChange}
          className="mr-4 h-4 w-4 text-blue-600 border-border-color rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling
          aria-label="チェックボックス"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left py-4 flex justify-between items-center focus:outline-none"
        >
          <span className="font-semibold">{title}</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>
      {isOpen && <div className="pb-4 pl-8">{children}</div>}
    </div>
  );
};

export interface ResultCardProps {
  answered: number;
  correct: number;
  streak: number;
  categoryStats: Record<string, { total: number; correct: number }>;
  incorrectQuestions: Question[];
  onRestart?: () => void;
  onRetrySelected?: (questionIds: number[]) => void;
}

export const ResultCard: FC<ResultCardProps> = ({
  answered,
  correct,
  streak,
  categoryStats,
  incorrectQuestions,
  onRestart,
  onRetrySelected,
}) => {
  const rate = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const [checkedQuestionIds, setCheckedQuestionIds] = useState<number[]>(
    incorrectQuestions.map((q) => q.id)
  );

  const handleCheckboxChange = (questionId: number) => {
    setCheckedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    setCheckedQuestionIds(incorrectQuestions.map((q) => q.id));
  };

  const handleDeselectAll = () => {
    setCheckedQuestionIds([]);
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#fa173d]">
        回答結果
      </h2>

      {/* 統計表示 */}
      <div className="grid grid-cols-2 gap-4 text-center mb-6">
        <div className="bg-primary-bg p-4 rounded-lg shadow-sm">
          <p className="text-sm">回答数</p>
          <p className="text-xl font-bold">{answered}</p>
        </div>
        <div className="bg-primary-bg p-4 rounded-lg shadow-sm">
          <p className="text-sm">正答数</p>
          <p className="text-xl font-bold">{correct}</p>
        </div>
        <div className="bg-primary-bg p-4 rounded-lg shadow-sm">
          <p className="text-sm">正答率</p>
          <p className="text-xl font-bold">{rate}%</p>
        </div>
        <div className="bg-primary-bg p-4 rounded-lg shadow-sm">
          <p className="text-sm">連続正解</p>
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
              className="flex items-center bg-primary-bg px-4 py-2 rounded-md shadow-sm"
            >
              <span className="flex-1 min-w-0 truncate whitespace-nowrap overflow-hidden mr-2 font-medium">
                {category}
              </span>
              <span className="shrink-0 truncate whitespace-nowrap text-right">
                {stat.correct} / {stat.total}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 間違えた問題 */}
      {incorrectQuestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">間違えた問題</h3>
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-border-color rounded-md text-sm font-medium hover:bg-primary-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              すべて選択
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-4 py-2 border border-border-color rounded-md text-sm font-medium hover:bg-primary-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              すべて解除
            </button>
          </div>
          <div>
            {incorrectQuestions.map((q) => (
              <AccordionItem
                key={q.id}
                title={q.question}
                isChecked={checkedQuestionIds.includes(q.id)}
                onCheckboxChange={() => handleCheckboxChange(q.id)}
              >
                <div className="bg-primary-bg p-4 rounded-lg">
                  <p>正解: {q.choices[q.answerIndex]}</p>
                  <p className="text-sm mt-2">
                    解説: {q.explanation}
                  </p>
                </div>
              </AccordionItem>
            ))}
          </div>
          {checkedQuestionIds.length > 0 && onRetrySelected && (
            <div className="text-center mt-6">
              <button
                onClick={() => onRetrySelected(checkedQuestionIds)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
              >
                選択した問題を再挑戦する
              </button>
            </div>
          )}
        </div>
      )}

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