"use client";

import type { JSX } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useQuizClient } from "../../hooks/useQuizClient";
import { QuestionCard } from "../../components/QuestionCard";
import { QuestionFooter } from "../../components/QuestionFooter";

/**
 * クイズページ全体のコンポーネント
 *
 * カスタムフックで用意された問題リストを受け取り、
 * 現在の問題表示と回答操作を組み合わせる。
 *
 * @returns {JSX.Element} クイズページの UI 要素
 */
export default function QuizClient(): JSX.Element {
  const router = useRouter();

  const { questions } = useQuizClient();

  const searchParams = useSearchParams();
  const totalToAnswer = Math.min(
    questions.length,
    Number(searchParams.get("count") ?? 10),
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);

  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const [categoryStats, setCategoryStats] = useState<
    Record<string, { total: number; correct: number }>
  >({});

  const current = questions[currentIndex] ?? null;

  /**
   * 次の問題へ進むハンドラ
   */
  const handleNext = (): void => {
    const isLast =
      answeredCount >= totalToAnswer || currentIndex >= questions.length - 1;

    if (isLast) {
      const params = new URLSearchParams({
        answered: String(answeredCount),
        correct: String(correctCount),
        streak: String(streak),
        categories: JSON.stringify(categoryStats),
      });

      router.push(`/result?${params.toString()}`);
      return;
    }

    setSelected(null);
    setCurrentIndex((i) => i + 1);
  };

  const handleAnswer = (selectedIndex: number) => {
    setSelected(selectedIndex);
    const isCorrect = current.answerIndex === selectedIndex;

    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;

        return newStreak;
      });
    } else {
      setStreak(0);
    }
    setCategoryStats((prev) => {
      const cat = current.category;
      const prevStat = prev[cat] ?? { total: 0, correct: 0 };
      return {
        ...prev,
        [cat]: {
          total: prevStat.total + 1,
          correct: isCorrect ? prevStat.correct + 1 : prevStat.correct,
        },
      };
    });
  };

  /**
   * クイズ終了ハンドラ（ルートに戻るなど実装可）
   */
  const handleFinish = (): void => {
    router.push("/");
  };

  if (!current) {
    return <p className="p-6 text-center">問題がありません</p>;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap justify-center gap-3 max-w-2xl mx-auto px-4">
        <div className="w-32 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg text-center">
          <p className="text-xs text-gray-500 whitespace-nowrap">回答数</p>
          <p className="font-bold text-sm whitespace-nowrap">
            {answeredCount} / {questions.length}
          </p>
        </div>
        <div className="w-32 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg text-center">
          <p className="text-xs text-gray-500 whitespace-nowrap">正答数</p>
          <p className="font-bold text-sm whitespace-nowrap">{correctCount}</p>
        </div>
        <div className="w-32 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg text-center">
          <p className="text-xs text-gray-500 whitespace-nowrap">正答率</p>
          <p className="font-bold text-sm whitespace-nowrap">
            {answeredCount > 0
              ? Math.round((correctCount / answeredCount) * 100)
              : 0}
            %
          </p>
        </div>
        <div className="w-32 bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg text-center">
          <p className="text-xs text-gray-500 whitespace-nowrap">連続正解</p>
          <p className="font-bold text-sm whitespace-nowrap">{streak}</p>
        </div>
      </div>

      <QuestionCard
        question={current}
        selected={selected}
        onSelect={handleAnswer}
      />

      {selected !== null && (
        <QuestionFooter
          explanation={current.explanation}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      )}
    </>
  );
}