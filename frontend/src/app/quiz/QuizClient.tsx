// src/app/quiz/page.tsx
"use client";

import { JSX, useState } from "react";
import { useQuizClient } from "../../hooks/useQuizClient";
import { QuestionCard } from "../../components/QuestionCard";
import { QuestionFooter } from "../../components/QuestionFooter";

/**
 * クイズページ全体のコンポーネント
 *
 * カスタムフックで用意された問題リストを受け取り、
 * 現在の問題表示と回答操作を組み合わせる。
 *
 * @returns JSX.Element
 */
export default function QuizClient(): JSX.Element {
  // フックからフィルタ／シャッフル／切り詰め済みの questions を取得
  const { questions } = useQuizClient();

  // 現在の問題インデックス
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // ユーザーが選択した選択肢インデックス
  const [selected, setSelected] = useState<number | null>(null);

  const current = questions[currentIndex] ?? null;

  /**
   * 次の問題へ進むハンドラ
   */
  const handleNext = (): void => {
    setSelected(null);
    setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
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
      {/* 問題文＋選択肢表示 */}
      <QuestionCard
        question={current}
        selected={selected}
        onSelect={setSelected}
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
