"use client";

import { useContext } from "react";

import { QuizContext } from "../context/QuizContext";

/**
 * クイズクライアントのカスタムフック
 * QuizContext から質問データを取得し、リセット機能を提供します。
 * @returns {object} 質問データとリセット関数を含むオブジェクト
 * @returns {Array} .questions - クイズの質問データの配列
 * @returns {Function} .reset - クイズの状態をリセットする関数
 */
export function useQuizClient() {
  const { questions, isLoading, setIsLoading } = useContext(QuizContext);
  return { questions, isLoading, setIsLoading };
}

export { QuizContext };
