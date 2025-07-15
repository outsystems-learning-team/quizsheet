"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { QuizContext } from "@/context/QuizContext";
import type { Question } from "@shared/types";

export default function SelectPage() {
  const router = useRouter();
  const { questions, setQuestions } = useContext(QuizContext);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  if (!questions.length) {
    return (
      <div className="text-center mt-16 text-red-600 text-lg">
        問題が読み込まれていません。<br />
        <strong>/start</strong> ページで問題を取得してください。
      </div>
    );
  }

  const toggleCheck = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(questions.map((q) => q.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleStartQuiz = () => {
    const filtered = questions.filter((q) => selectedIds.includes(q.id));

    if (filtered.length === 0) return;

    setQuestions(filtered); // クイズで使う全情報を保持
    router.push("/quiz");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
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
            <div className="flex-1">
              <p className="font-medium">{q.question}</p>
              <p className="text-sm text-gray-500 mt-1">
                カテゴリ: {q.category}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={handleStartQuiz}
        disabled={selectedIds.length === 0}
        className="mt-6 w-full py-3 bg-[#fa173d] text-white rounded-lg disabled:opacity-50"
      >
        スタート（全{selectedIds.length}問）
      </button>
    </div>
  );
}
