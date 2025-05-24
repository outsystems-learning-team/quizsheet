// frontend/src/context/QuizContext.tsx
"use client";

import React, { createContext, useState, ReactNode } from "react";

type QuizContextValue = {
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
};

export const QuizContext = createContext<QuizContextValue>({
  questions: [],
  setQuestions: () => {},
});

export function QuizProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);

  return (
    <QuizContext.Provider value={{ questions, setQuestions }}>
      {children}
    </QuizContext.Provider>
  );
}
