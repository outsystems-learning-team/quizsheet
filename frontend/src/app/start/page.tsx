"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";
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

/**
 * スタートページコンポーネント
 * クイズの開始設定（問題数、シート、カテゴリ選択）を提供します。
 * @returns {JSX.Element} スタートページの UI 要素
 */
export default function StartPage() {
  const router = useRouter();

  /* ------------------------------  state  ------------------------------ */
  const [numQuestions, setNumQuestions] = useState(20);
  const [quizNames, setQuizNames] = useState<QuizName[]>([]); // sheets -> quizNames
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeQuizName, setActiveQuizName] = useState<string>(""); // activeSheet -> activeQuizName
  const [questionOrder, setQuestionOrder] = useState("random"); // ★ 出題順序の状態
  const { setQuestions, isLoading, setIsLoading } = useContext(QuizContext);

  /* ----------------------------  fetch once  --------------------------- */
  useEffect(() => {
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
        }

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [setIsLoading]);

  /* ---------------------------  form submit  --------------------------- */
  const handleStart = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      if (selectedCategories.length === 0) {
        setError("カテゴリが選択されていません。");
        setIsLoading(false);
        return;
      }

      // クイズデータの取得
      const quizzesRes = await fetch(`/api/quizzes?quiz_name=${encodeURIComponent(activeQuizName)}&categories=${encodeURIComponent(selectedCategories.join(','))}`);

      if (!quizzesRes.ok) {
        const errorText = await quizzesRes.text(); // Read response body as text for more info
        throw new Error(`Failed to fetch quizzes: ${quizzesRes.status} ${quizzesRes.statusText} - ${errorText}`);
      }

      const questions: Question[] = await quizzesRes.json();

      if (!Array.isArray(questions)) { // Explicitly check if it's an array
        throw new Error("API response is not an array of questions.");
      }

      if (questions.length === 0) {
        setError("選択条件に合う問題がありません");
        return;
      }

      /* --- シャッフル & 切り詰め --- */
      const processedQuestions =
        questionOrder === "random"
          ? [...questions].sort(() => Math.random() - 0.5)
          : questions;

      const finalQs: Question[] = processedQuestions.slice(0, numQuestions);

      setQuestions(finalQs);
      router.push(`/quiz`);
    } catch (e) {
      console.error("Error in handleStart:", e); // Log the full error
      setError(e instanceof Error ? e.message : "取得失敗");
    } finally {
      setIsLoading(false);
    }
  };

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

  /** チェックボックスの選択／解除をトグル */
  const handleCategoryToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSelectedCategories((prev) =>
      e.target.checked ? [...prev, name] : prev.filter((c) => c !== name),
    );
  };

  /** 全て選択 */
  const handleSelectAll = () => {
    setSelectedCategories(categories.map((c) => c.category_name));
  };

  /** 全て解除 */
  const handleDeselectAll = () => {
    setSelectedCategories([]);
  };

  /* ------------------------------  view  ------------------------------- */
  return (
    <form
      onSubmit={handleStart}
      className="max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        出題設定
      </h1>

      {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

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

      {!isLoading && (
        <>
          <label className="block mb-1">カテゴリー選択</label>
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm sm:text-base mr-2 text-[#fa173d]"
            >
              全て選択
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-sm sm:text-base text-[#fa173d]"
            >
              全て解除
            </button>
          </div>

          <div className="grid gap-2 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <label key={cat.category_name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={cat.category_name}
                  checked={selectedCategories.includes(cat.category_name)}
                  onChange={handleCategoryToggle}
                  className="w-4 h-4 shrink-0"
                />
                <span
                  className="truncate whitespace-nowrap overflow-hidden w-full"
                  title={cat.category_name}
                >
                  {cat.category_name}
                </span>
              </label>
            ))}
          </div>
        </>
      )}

      {/* 問題数入力欄 */}
      <div className="mb-4">
        <label htmlFor="numQuestions" className="block mb-1">
          問題数
        </label>
        <input
          id="numQuestions"
          type="number"
          min={1}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      {/* ★ 出題順序の選択 */}
      <div className="mb-6">
        <label className="block mb-2">出題順</label>
        <div className="flex items-center gap-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="order"
              value="random"
              checked={questionOrder === "random"}
              onChange={(e) => setQuestionOrder(e.target.value)}
              className="w-4 h-4"
            />
            <span className="ml-2">ランダム</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="order"
              value="in_order"
              checked={questionOrder === "in_order"}
              onChange={(e) => setQuestionOrder(e.target.value)}
              className="w-4 h-4"
            />
            <span className="ml-2">順番通り</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-3 rounded-lg text-white bg-[#fa173d] hover:opacity-90 disabled:opacity-50"
        
        onClick={handleStart}
      >
        スタート
      </button>
      {isLoading && <LoadingOverlay />}
    </form>
  );
}