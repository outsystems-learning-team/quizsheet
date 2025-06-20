// src/app/quiz/page.tsx
"use client";

import { JSX, useState } from "react";
import { useQuizClient } from "../../hooks/useQuizClient";
import { QuestionCard } from "../../components/QuestionCard";
import { QuestionFooter } from "../../components/QuestionFooter";
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * クイズページ全体のコンポーネント
 *
 * カスタムフックで用意された問題リストを受け取り、
 * 現在の問題表示と回答操作を組み合わせる。
 *
 * @returns JSX.Element
 */
export default function QuizClient(): JSX.Element {
  const router = useRouter();

  // フックからフィルタ／シャッフル／切り詰め済みの questions を取得
  const { questions } = useQuizClient();

  //問題出題数 
  const searchParams = useSearchParams();
  const totalToAnswer = Number(searchParams.get('count') ?? 10); // デフォルト10

  // 現在の問題インデックス
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // ユーザーが選択した選択肢インデックス
  const [selected, setSelected] = useState<number | null>(null);

  //回答状況
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  //const [maxStreak, setMaxStreak] = useState(0);

  const [categoryStats, setCategoryStats] = useState<Record<string, { total: number; correct: number }>>({});

  const current = questions[currentIndex] ?? null;

  

  /**
   * 次の問題へ進むハンドラ
   */
  const handleNext = (): void => {
    
  //最終問題問題か判定
  const isLast =
  answeredCount >= totalToAnswer || currentIndex + 1 >= questions.length;

  //最終問題の場合は回答結果画面へ進む
  if (isLast) {
    const params = new URLSearchParams({
      answered: String(answeredCount),
      correct: String(correctCount),
      streak: String(streak),
      categories: JSON.stringify(categoryStats),
    });

    router.push(`/result?${params.toString()}`);
    return; // ← これで以降の setState を止める
  }

    setSelected(null);
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const handleAnswer = (selectedIndex: number) => {
    setSelected(selectedIndex);
    const isCorrect = current.answerIndex === selectedIndex;

    setAnsweredCount((prev) => prev + 1);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
       const newStreak = prev + 1;
       //setMaxStreak((m) => Math.max(m, newStreak));
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
    // 例: トップページへ戻る
    window.location.href = "/";
  };

  // 問題がない場合のフォールバック表示
  if (!current) {
    return <p className="p-6 text-center">問題がありません</p>;
  }

  return (
    <>
      {/* 回答状況 */}
      <div className="mb-4 text-center text-sm text-gray-600">
        回答数: {answeredCount} / {questions.length}・
        正答数: {correctCount}・
        正答率: {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%・
        連続正解: {streak}
      </div>

      {/* 問題文＋選択肢表示 */}
      <QuestionCard
        question={current}
        selected={selected}
        onSelect={handleAnswer}
      />

      {/* 回答後に解説＋ボタン表示 */}
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
