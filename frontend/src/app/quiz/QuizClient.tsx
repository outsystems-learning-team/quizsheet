// frontend/app/quiz/page.tsx
"use client";

import { useState, useEffect, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QuizContext } from "../context/QuizContext";

export default function QuizClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { questions: allQuestions } = useContext(QuizContext);

  // クエリから取得された設定値
  const count = Number(params.get("count") ?? "0");

  const rawCategories = params.getAll("category");
  // 安定化キー
  const catsKey = rawCategories.join(",");

  // このページで扱う問題リスト
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // まだコンテキストが空なら何もしない
    if (allQuestions.length === 0) return;

    // 初回マウント時 or count/catsKey が変わったときだけ
    if (count <= 0 || rawCategories.length === 0) {
      router.push("/");
      return;
    }

    console.log(allQuestions);

    // 1. 絞り込み
    let filtered = allQuestions.filter((q) =>
      rawCategories.includes(q.category)
    );

    // 2. シャッフル
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    // 3. 切り詰め
    if (filtered.length > count) {
      filtered = filtered.slice(0, count);
    }

    console.log(filtered);
    setQuestions(filtered);
  }, [allQuestions, count, catsKey, router]);

  // --- 以下は questions を使った実際の画面表示例 ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const current = questions[currentIndex] ?? null;

  const handleNext = () => {
    setSelected(null);
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  };
  const handleFinish = () => {
    router.push("/");
  };

  if (!current) {
    return <p className="p-6 text-center">問題がありません</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <p className="text-sm text-gray-500 mb-1">{current.category}</p>
      <h2 className="text-xl font-semibold mb-4">{current.question}</h2>

      <ul className="space-y-2 mb-6">
        {current.choices.map((choice, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === current.answerIndex;
          let base =
            "block w-full text-left px-4 py-2 rounded-lg cursor-pointer ";
          if (selected !== null) {
            if (isCorrect) {
              base += "bg-green-100 border border-green-500 text-green-800";
            } else if (isSelected) {
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

      {selected !== null && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-300 p-4 rounded-lg">
            <h3 className="font-medium mb-2">解説</h3>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm">
              {current.explanation}
            </pre>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 rounded-lg text-white bg-[#0f0e0b] hover:opacity-90 transition"
            >
              終了
            </button>
            <button
              type="button"
              onClick={handleNext}
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
