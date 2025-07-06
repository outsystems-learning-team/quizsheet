// frontend/src/context/QuizContext.tsx
"use client";

import React, { createContext, useState, ReactNode, JSX } from "react";
import {Question} from "@quizsheet/shared/types"

export type QuizState = {
  selectedCategory: string;
  selectedSheet: string;
  numQuestions: number;
  currentQuestionIndex: number;
  userAnswers: (string | null)[];
  score: number;
};

export type QuizContextValue = {
  quizState: QuizState;
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>;
  questions: Question[];
  setQuestions: (qs: Question[]) => void;
};

export const QuizContext = createContext<QuizContextValue>({
  quizState: {
    selectedCategory: "",
    selectedSheet: "",
    numQuestions: 5,
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
  },
  setQuizState: () => {},
  questions: [],
  setQuestions: () => {},
});

export function QuizProvider({ children }: { children: ReactNode }): JSX.Element {
  const [quizState, setQuizState] = useState<QuizState>({
    selectedCategory: "",
    selectedSheet: "",
    numQuestions: 5,
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  return (
    <QuizContext.Provider value={{ quizState, setQuizState, questions, setQuestions }}>
      {children}
    </QuizContext.Provider>
  );
}