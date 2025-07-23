"use client";

import { ChangeEvent, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

import { QuizContext } from "@/context/QuizContext";
import { LoadingOverlay } from "../../components/LoadingOverlay";

// 型定義を修正
interface QuizName {
  id: number;
  quiz_name: string;
  quiz_name_jp: string;
}

interface Category {
  id: number; // idを追加
  category_name: string;
}

import { Question } from "@shared/types";

export default function SelectPage() {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // /start/page.tsxから流用
    const [selectedNumQuestionsOption, setSelectedNumQuestionsOption] = useState<string>("20");
    const selectedNumQuestionsOptionRef = useRef(selectedNumQuestionsOption);
    useEffect(() => { selectedNumQuestionsOptionRef.current = selectedNumQuestionsOption; }, [selectedNumQuestionsOption]);
  
    const [freeNumQuestions, setFreeNumQuestions] = useState<number>(20);
    const freeNumQuestionsRef = useRef(freeNumQuestions);
    useEffect(() => { freeNumQuestionsRef.current = freeNumQuestions; }, [freeNumQuestions]);
  
    const [quizNames, setQuizNames] = useState<QuizName[]>([]); // sheets -> quizNames
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [activeQuizName, setActiveQuizName] = useState<string>(""); // activeSheet -> activeQuizName
    const [questionOrder, setQuestionOrder] = useState("random"); // ★ 出題順序の状態
    const { questions,setQuestions, isLoading, setIsLoading, setAnsweredCount, setCorrectCount, setStreak, setCategoryStats, setIncorrectQuestions, resetQuizState } = useContext(QuizContext); // eslint-disable-line @typescript-eslint/no-unused-vars
  
  useEffect(() => {
    // コンポーネントがマウントされたときに結果関連のstateをリセット
    resetQuizState();

    (async () => {
      setIsLoading(true);
      try {
        // クイズ名リストの取得
        const quizNamesRes = await fetch('/api/quiz-names');
        if (!quizNamesRes.ok) throw new Error(`Failed to fetch quiz names: ${quizNamesRes.statusText}`);
        const quizNamesData: QuizName[] = await quizNamesRes.json();
        setQuizNames(quizNamesData);

        if (quizNamesData.length > 0) {
          setActiveQuizName(quizNamesData[0].quiz_name);
          // カテゴリリストの取得
          const categoriesRes = await fetch(`/api/categories?quiz_name=${encodeURIComponent(quizNamesData[0].quiz_name)}`);
          if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
          const categoriesData: Category[] = await categoriesRes.json();
          setCategories(categoriesData);

          // 問題の取得
      // クイズデータの取得
      const quizzesRes = await fetch(`/api/quizzes?quiz_name=${encodeURIComponent(activeQuizName)}&categories=${encodeURIComponent(categoriesData.join(','))}`);
      if (!quizzesRes.ok) {
        const errorText = await quizzesRes.text(); // Read response body as text for more info
        throw new Error(`Failed to fetch quizzes: ${quizzesRes.status} ${quizzesRes.statusText} - ${errorText}`);
      }

      const questions: Question[] = await quizzesRes.json();
      setQuestions(questions);
      if (!Array.isArray(questions)) { // Explicitly check if it's an array
        throw new Error("API response is not an array of questions.");
      }
        }

        const handleQuizNameChange = async (e: ChangeEvent<HTMLSelectElement>) => {
            const quizName = e.target.value;
            setActiveQuizName(quizName);
            setSelectedCategories([]);
        
            // カテゴリリストの再取得
            setIsLoading(true);
            try {
              const categoriesRes = await fetch(`/api/categories?quiz_name=${encodeURIComponent(quizName)}`);
              if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
              const categoriesData: Category[] = await categoriesRes.json();
              setCategories(categoriesData);
            } catch (e) {
              setError(
                `カテゴリ取得に失敗しました: ${e instanceof Error ? e.message : "不明なエラー"}`,
              );
            } finally {
              setIsLoading(false);
            }
          };

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [setIsLoading, resetQuizState, setQuizNames, setCategories, setError]);

  const handleQuizNameChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const quizName = e.target.value;
    setActiveQuizName(quizName);
    setSelectedCategories([]);
  }

  // 選択関連
  const toggleCheck = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(questions.map((q) => q.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleStartQuiz = () => {
    setIsLoading(true);
    const filtered = questions.filter((q) => selectedIds.includes(q.id));
    if (filtered.length === 0) return;
    setQuestions(filtered);
    router.push("/quiz");
  };

  return (
    <form
      onSubmit={handleStartQuiz}
      className="max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl font-bold text-center mb-6">
        問題選択
      </h1>

      {!isLoading && (
        <div className="mb-4">
          <label className="block mb-1">対象問題</label>
          <select
            className="w-full border rounded p-2"
            value={activeQuizName}
            onChange={handleQuizNameChange}
          >
            {quizNames.map((s) => (
              <option key={s.id} value={String(s.quiz_name)}>
                {s.quiz_name_jp}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="text-center mb-4 text-red-500">{error}</div>
      )}

      {/* 読み込み中 */}
      {isLoading ? (
        <div className="text-center text-gray-500">読み込み中...</div>
      ) : (
        <>
          <div className="flex justify-end gap-4 mb-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-[#fa173d] hover:underline"
            >
              全て選択
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-[#fa173d] hover:underline"
            >
              全て解除
            </button>
          </div>

          <ul className="divide-y border rounded">
            {questions.map((q) => (
              <li key={q.id} className="p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(q.id)}
                  onChange={() => toggleCheck(q.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium">{q.question}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    カテゴリ: {q.category}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={handleStartQuiz}
            disabled={selectedIds.length === 0}
            className="mt-6 w-full py-3 bg-[#fa173d] text-white rounded-lg disabled:opacity-50"
          >
            スタート（全{selectedIds.length}問）
          </button>
        </>
      )}
    </form>
  );
}
