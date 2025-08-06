// src/app/quiz/QuizClient.tsx

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useContext, useEffect, useRef, useState } from "react";

import { QuizContext } from "@/context/QuizContext";
import { LoadingOverlay } from "../../components/LoadingOverlay";
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
  const { data: session } = useSession();

  const { questions, isLoading, answeredCount, setAnsweredCount, correctCount, setCorrectCount, streak, setStreak, setCategoryStats, setIncorrectQuestions } = useContext(QuizContext);

  const totalToAnswer = questions.length;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const questionStartTime = useRef<number | null>(null);

  const current = questions[currentIndex] ?? null;

  useEffect(() => {
    if (current) {
      questionStartTime.current = Date.now();
    }
  }, [current]);

  /**
   * 次の問題へ進むハンドラ
   */
  const handleNext = (): void => {
    setSelected(null);
    setCurrentIndex((i) => i + 1);
  };

  const handleAnswer = async (selectedIndex: number) => {
    if (!current) return;

    console.log("handleAnswer called"); // ★ ログ追加
    console.log("Session object:", session); // ★ ログ追加

    const timeTaken = questionStartTime.current ? Math.round((Date.now() - questionStartTime.current) / 1000) : undefined;
    setSelected(selectedIndex);
    const isCorrect = current.answerIndex === selectedIndex;

    // Save attempt to DB
    if (session?.user?.id) {
      console.log("Session user ID found, attempting to save..."); // ★ ログ追加
      try {
        const response = await fetch('/api/quiz-attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizQuestionId: current.id,
            isCorrect: isCorrect,
            userAnswer: current.choices[selectedIndex],
            timeTakenSeconds: timeTaken,
          }),
        });
        console.log("API response:", response); // ★ ログ追加
        if (!response.ok) {
          console.error("API request failed:", await response.text());
        }
      } catch (error) {
        console.error("Failed to save quiz attempt:", error);
        // Optionally, handle the error in the UI
      }
    } else {
      console.log("Session user ID not found. Skipping save."); // ★ ログ追加
    }

    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
      setIncorrectQuestions((prev) => [...prev, current]);
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

    // 最後の問題かどうかの判定を追加
    if (currentIndex >= questions.length - 1) {
      // 少し待ってから結果ページに遷移
      setTimeout(() => {
        router.push(`/result`);
      }, 100); // 100msの遅延
    }
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
        <div className="w-32 bg-primary-bg border border-border-color px-3 py-2 rounded-lg text-center">
          <p className="text-xs whitespace-nowrap">回答数</p>
          <p className="font-bold text-sm whitespace-nowrap">
            {answeredCount} / {questions.length}
          </p>
        </div>
        <div className="w-32 bg-primary-bg border border-border-color px-3 py-2 rounded-lg text-center">
          <p className="text-xs whitespace-nowrap">正答数</p>
          <p className="font-bold text-sm whitespace-nowrap">{correctCount}</p>
        </div>
        <div className="w-32 bg-primary-bg border border-border-color px-3 py-2 rounded-lg text-center">
          <p className="text-xs whitespace-nowrap">正答率</p>
          <p className="font-bold text-sm whitespace-nowrap">
            {answeredCount > 0
              ? Math.round((correctCount / answeredCount) * 100)
              : 0}
            %
          </p>
        </div>
        <div className="w-32 bg-primary-bg border border-border-color px-3 py-2 rounded-lg text-center">
          <p className="text-xs whitespace-nowrap">連続正解</p>
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

      {isLoading && <LoadingOverlay />}
    </>
  );
}