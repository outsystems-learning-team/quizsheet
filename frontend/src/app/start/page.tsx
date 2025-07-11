"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  CategoryNameList,
  InitData,
  Question,
  QuestionsResponse,
  SheetNameList,
} from "@shared/types";
import { QuizContext } from "@/context/QuizContext";
import { fetchQuizApi } from "../../lib/api";
import { LoadingOverlay } from "../../components/LoadingOverlay";

/**
 * スタートページコンポーネント
 * クイズの開始設定（問題数、シート、カテゴリ選択）を提供します。
 * @returns {JSX.Element} スタートページの UI 要素
 */
export default function StartPage() {
  const router = useRouter();

  /* ------------------------------  state  ------------------------------ */
  const [numQuestions, setNumQuestions] = useState(20);
  const [sheets, setSheets] = useState<SheetNameList[]>([]);
  const [categories, setCategories] = useState<CategoryNameList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [questionOrder, setQuestionOrder] = useState("random"); // ★ 出題順序の状態
  const { setQuestions, isLoading, setIsLoading } = useContext(QuizContext);

  /* ----------------------------  fetch once  --------------------------- */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const init = await fetchQuizApi<InitData>({
          key: "sheet_name_list",
        });

        setSheets(init.sheetNameList);
        setCategories(init.categoryNameList);

        if (init.sheetNameList.length) {
          setActiveSheet(init.sheetNameList[0].sheetName);
        }

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ---------------------------  form submit  --------------------------- */
  const handleStart = async () => {
    setIsLoading(true);
    try {
      const { questions }: QuestionsResponse =
        await fetchQuizApi<QuestionsResponse>({
          key: "select_quiz",
          targetSheet: activeSheet,
          category: selectedCategories,
        });

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
      router.push(`/quiz?count=${finalQs.length}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const sheetName = e.target.value;
    setActiveSheet(sheetName);
    setSelectedCategories([]);

    setIsLoading(true);
    try {
      const catList = await fetchQuizApi<CategoryNameList[]>(({
        key: "category_list",
        targetSheet: sheetName,
      }));
      setCategories(catList);
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
    setSelectedCategories(categories.map((c) => c.categoryName));
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

      {!isLoading && !error && (
        <div className="mb-4">
          <label className="block mb-1">対象問題</label>
          <select
            className="w-full border rounded p-2"
            value={activeSheet}
            onChange={handleSheetChange}
          >
            {sheets.map((s) => (
              <option key={s.id} value={String(s.sheetName)}>
                {s.text}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isLoading && !error && (
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
              <label key={cat.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={cat.categoryName}
                  checked={selectedCategories.includes(cat.categoryName)}
                  onChange={handleCategoryToggle}
                  className="w-4 h-4 shrink-0"
                />
                <span
                  className="truncate whitespace-nowrap overflow-hidden w-full"
                  title={cat.categoryName}
                >
                  {cat.categoryName}
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
        disabled={isLoading || !!error}
        onClick={handleStart}
      >
        スタート
      </button>
      {isLoading && <LoadingOverlay />}
    </form>
  );
}
