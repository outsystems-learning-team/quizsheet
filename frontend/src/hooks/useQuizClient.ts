// frontend/src/hooks/useQuizClient.ts
"use client";

import { useContext } from "react";
import { QuizContext } from "../context/QuizContext";

export function useQuizClient() {
  const { questions } = useContext(QuizContext); // ← 正しく型推論される
  const reset = () => {}; // 必要なら実装
  return { questions, reset };
}

export { QuizContext };

