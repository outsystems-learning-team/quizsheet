"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";

import { QuizContext } from "@/context/QuizContext";
import { ResultCard } from "@/components/ResultCard";

/**
 * 結果ページコンポーネント
 * クエリパラメータから結果を取得し、ResultCard を表示します。
 * @returns {JSX.Element} 結果ページの UI 要素
 */
export default function ResultPage() {
  const router = useRouter();
  const { answeredCount, correctCount, streak, categoryStats, incorrectQuestions, setQuestions, setAnsweredCount, setCorrectCount, setStreak, setCategoryStats, setIncorrectQuestions } = useContext(QuizContext);

  const handleRetrySelected = (questionIds: number[]) => {
    const selectedQuestions = incorrectQuestions.filter((q) =>
      questionIds.includes(q.id)
    );
    setQuestions(selectedQuestions);
    setAnsweredCount(0);
    setCorrectCount(0);
    setStreak(0);
    setCategoryStats({});
    setIncorrectQuestions([]); // 間違えた問題リストをクリア
    router.push("/quiz");
  };

  return (
    <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow">
      <ResultCard
        answered={answeredCount}
        correct={correctCount}
        streak={streak}
        categoryStats={categoryStats}
        incorrectQuestions={incorrectQuestions}
        onRestart={() => router.push("/start")}
        onRetrySelected={handleRetrySelected}
      />
    </div>
  );
}
