"use client";

import type { ReactNode, JSX, Dispatch, SetStateAction } from "react";
import { createContext, useState } from "react";

import { Question } from "@shared/types";

/**
 * QuizContext で管理する状態の型定義
 *
 * @property {Question[]} questions - 現在ロードされている問題リスト
 * @property {(qs: Question[]) => void} setQuestions - 問題リストを更新する関数
 */
export type QuizContextValue = {
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  answeredCount: number;
  setAnsweredCount: Dispatch<SetStateAction<number>>;
  correctCount: number;
  setCorrectCount: Dispatch<SetStateAction<number>>;
  streak: number;
  setStreak: Dispatch<SetStateAction<number>>;
  categoryStats: Record<string, { total: number; correct: number }>;
  setCategoryStats: Dispatch<SetStateAction<Record<string, { total: number; correct: number }>>>;
  incorrectQuestions: Question[];
  setIncorrectQuestions: Dispatch<SetStateAction<Question[]>>;
};

/**
 * QuizContext のデフォルト値
 *
 * - 初期状態では空の問題リスト
 * - setQuestions はダミー関数
 */
export const QuizContext = createContext<QuizContextValue>({
  questions: [],
  setQuestions: () => {},
  isLoading: false,
  setIsLoading: () => {},
  answeredCount: 0,
  setAnsweredCount: () => {},
  correctCount: 0,
  setCorrectCount: () => {},
  streak: 0,
  setStreak: () => {},
  categoryStats: {},
  setCategoryStats: () => {},
  incorrectQuestions: [],
  setIncorrectQuestions: () => {},
});

/**
 * QuizProvider コンポーネント
 *
 * QuizContext をラップし、子コンポーネントに questions と setQuestions を提供する。
 *
 * @param {{ children: ReactNode }} props
 * @param {ReactNode} props.children - QuizContext を利用する子要素
 * @returns {JSX.Element} QuizContext.Provider でラップした子要素
 */
export function QuizProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, { total: number; correct: number }>>({});
  const [incorrectQuestions, setIncorrectQuestions] = useState<Question[]>([]);

  return (
    <QuizContext.Provider value={{
      questions,
      setQuestions,
      isLoading,
      setIsLoading,
      answeredCount,
      setAnsweredCount,
      correctCount,
      setCorrectCount,
      streak,
      setStreak,
      categoryStats,
      setCategoryStats,
      incorrectQuestions,
      setIncorrectQuestions,
    }}>
      {children}
    </QuizContext.Provider>
  );
}