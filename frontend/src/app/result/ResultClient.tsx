"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

import { QuizContext } from "@/context/QuizContext";
import { ResultCard } from "@/components/ResultCard";

/**
 * 結果ページコンポーネント
 * クエリパラメータから結果を取得し、ResultCard を表示します。
 * @returns {JSX.Element} 結果ページの UI 要素
 */
export default function ResultPage() {
  const router = useRouter();
  const { answeredCount, correctCount, streak, categoryStats, incorrectQuestions } = useContext(QuizContext);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
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
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">間違えた問題</h2>
          {incorrectQuestions.map((question, index) => (
            <div key={question.id} className="border rounded-lg mb-2">
              <button
                className="w-full text-left p-4 font-semibold flex justify-between items-center"
                onClick={() => toggleAccordion(index)}
              >
                <span>{question.question}</span>
                <span>{openAccordion === index ? '▲' : '▼'}</span>
              </button>
              {openAccordion === index && (
                <div className="p-4 border-t bg-gray-50">
                  <p className="font-bold mb-2">解説:</p>
                  <pre className="whitespace-pre-wrap text-sm">{question.explanation}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
