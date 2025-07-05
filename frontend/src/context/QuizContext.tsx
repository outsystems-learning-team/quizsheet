"use client";

import type { ReactNode, JSX } from "react";
import { createContext, useState } from "react";

import { Question } from "../../../shared/types";

/**
 * QuizContext で管理する状態の型定義
 *
 * @property {Question[]} questions - 現在ロードされている問題リスト
 * @property {(qs: Question[]) => void} setQuestions - 問題リストを更新する関数
 */
export type QuizContextValue = {
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
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

  return (
    <QuizContext.Provider value={{ questions, setQuestions }}>
      {children}
    </QuizContext.Provider>
  );
}
