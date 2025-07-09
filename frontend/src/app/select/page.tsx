"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  CategoryNameList,
  InitData,
  Question,
  QuestionsResponse,
  SheetNameList,
} from "@shared/types";
import { QuizContext } from "@/context/QuizContext";
import { fetchQuizApi } from "../../lib/api";
import { LoadingOverlay } from "../../components/LoadingOverlay";

/**
 * 選択された問題の表示と選択画面
 * @returns JSX.Element
 */
export default function SelectPage(){
  const router = useRouter();
  const { questions } = useContext(QuizContext);

  const [selectedIds, setSelectedIds] = useState<number[]>(
    questions.map((q) => q.id) // 初期状態：全選択
  );

  if (!questions.length) {
    return (
      <div className="text-center mt-20 text-lg text-red-600">
        問題が読み込まれていません。<br />
        先に <strong>/start</strong> ページから選択してください。
      </div>
    );
  }

  /** チェック切り替え */
  const toggleCheck = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /** 全選択 */
  const handleSelectAll = () => {
    setSelectedIds(questions.map((q) => q.id));
  };

  /** 全解除 */
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  /** クイズ開始（選択された問題だけに絞る） */
  const handleStartQuiz = () => {
    const filtered = questions.filter((q) => selectedIds.includes(q.id));
    if (filtered.length === 0) return;

    // 選択された問題だけに上書き（上書きしてから遷移）
    const { setQuestions } = useContext(QuizContext);
    setQuestions(filtered);
    router.push(`/quiz?count=${filtered.length}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">問題選択</h1>

      <div className="flex justify-end gap-4 mb-4">
        <button
          onClick={handleSelectAll}
          className="text-sm text-[#fa173d] hover:underline"
        >
          全て選択
        </button>
        <button
          onClick={handleDeselectAll}
          className="text-sm text-[#fa173d] hover:underline"
        >
          全て解除
        </button>
      </div>

      <ul className="divide-y border rounded">
        {questions.map((q) => (
          <li key={q.id} className="p-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedIds.includes(q.id)}
              onChange={() => toggleCheck(q.id)}
              className="mt-1"
            />
            <div>
              <p className="font-medium">{q.question}</p>
              {q.category && (
                <p className="text-sm text-gray-500">カテゴリ: {q.category}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={handleStartQuiz}
        disabled={selectedIds.length === 0}
        className="mt-6 w-full py-3 bg-[#fa173d] text-white rounded-lg disabled:opacity-50"
      >
        クイズ開始（{selectedIds.length}問）
      </button>
    </div>
  );
}
