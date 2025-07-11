"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

import { QuizContext } from "@/context/QuizContext";
import { ResultCard } from "@/components/ResultCard";
import { Question } from "@shared/types";

/**
 * 結果ページコンポーネント
 * クエリパラメータから結果を取得し、ResultCard を表示します。
 * @returns {JSX.Element} 結果ページの UI 要素
 */
export default function ResultPage() {
  const router = useRouter();
  const {
    answeredCount,
    correctCount,
    streak,
    categoryStats,
    incorrectQuestions,
    setQuestions,
    setAnsweredCount,
    setCorrectCount,
    setStreak,
    setCategoryStats,
    setIncorrectQuestions,
  } = useContext(QuizContext);

  const [selectedIncorrectQuestions, setSelectedIncorrectQuestions] = useState<
    Question[]
  >([]);

  const handleCheckboxChange = (question: Question) => {
    setSelectedIncorrectQuestions((prevSelected) =>
      prevSelected.includes(question)
        ? prevSelected.filter((q) => q !== question)
        : [...prevSelected, question]
    );
  };

  const handleRetakeSelected = () => {
    setQuestions(selectedIncorrectQuestions);
    setAnsweredCount(0);
    setCorrectCount(0);
    setStreak(0);
    setCategoryStats({});
    setIncorrectQuestions([]);
    router.push("/quiz");
  };

  return (
    <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow">
      <ResultCard
        answered={answeredCount}
        correct={correctCount}
        streak={streak}
        categoryStats={categoryStats}
        onRestart={() => router.push("/start")}
      />

      {incorrectQuestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">間違えた問題</h3>
          <ul className="space-y-3">
            {incorrectQuestions.map((question, index) => (
              <li
                key={question.id}
                className="flex items-start p-3 bg-gray-50 rounded-lg"
              >
                <input
                  type="checkbox"
                  id={`question-${question.id}`}
                  checked={selectedIncorrectQuestions.includes(question)}
                  onChange={() => handleCheckboxChange(question)}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`question-${question.id}`} className="text-sm text-gray-800">
                  {question.question}
                </label>
              </li>
            ))}
          </ul>
          <button
            onClick={handleRetakeSelected}
            disabled={selectedIncorrectQuestions.length === 0}
            className={`mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${selectedIncorrectQuestions.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}
            `}
          >
            選択した問題を再回答
          </button>
        </div>
      )}
    </div>
  );
}
