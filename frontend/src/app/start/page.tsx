"use client";

import { QuizContext } from "@/context/QuizContext";
import type { CategoryNameList, InitData, Question, QuestionsResponse, SheetNameList } from "@shared/types"; // 共有型があれば
import { useRouter } from "next/navigation";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { fetchQuizApi } from "../../lib/api";

export default function StartPage() {
  const router = useRouter();

  /* ------------------------------  state  ------------------------------ */
  const [numQuestions, setNumQuestions] = useState(20);
  const [sheets, setSheets] = useState<SheetNameList[]>([]);
  const [categories, setCategories] = useState<CategoryNameList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const { setQuestions } = useContext(QuizContext);

  /* ----------------------------  fetch once  --------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const init = await fetchQuizApi<InitData>({
          key: "sheet_name_list", // SPREAD_SHEET_INIT_DATA と対応
        });

        setSheets(init.sheetNameList);
        setCategories(init.categoryNameList);

        // activeSheet はフロント側でも明示しておく
        if (init.sheetNameList.length) {
          setActiveSheet(init.sheetNameList[0].sheetName);
        }

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------------------  form submit  --------------------------- */
  const handleStart = async () => {
    try {
      const { questions }: QuestionsResponse = await fetchQuizApi<QuestionsResponse>({
        key: "select_quiz",
        targetSheet: activeSheet,
        category: selectedCategories,
      });

      if (questions.length === 0) {
        setError("選択条件に合う問題がありません");
        return;
      }

      /* --- シャッフル (F-Y) --- */
      const shuffled = [...questions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      /* --- 切り詰め --- */
      const finalQs: Question[] = shuffled.slice(0, numQuestions);

      setQuestions(finalQs);
      router.push(`/quiz?count=${finalQs.length}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得失敗");
    }
  };

  const handleSheetChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const sheetName = e.target.value;
    setActiveSheet(sheetName); // 選択状態更新
    setSelectedCategories([]); // チェックをリセット

    try {
      const catList = await fetchQuizApi<CategoryNameList[]>({
        key: "category_list",
        targetSheet: sheetName,
      });
      setCategories(catList);
    } catch (err) {
      console.error(err);
      setError("カテゴリ取得に失敗しました");
    }
  };

  /** チェックボックスの選択／解除をトグル */
  const handleCategoryToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSelectedCategories((prev) => (e.target.checked ? [...prev, name] : prev.filter((c) => c !== name)));
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">出題設定</h1>

      {loading && <p className="mb-4 text-center">ロード中...</p>}
      {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

      {!loading && !error && (
        <div className="mb-4">
          <label className="block mb-1">対象問題</label>
          <select
            className="w-full border rounded p-2"
            value={activeSheet} // ★追加
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

      {!loading && !error && (
        <>
          {/* 全選択／全解除ボタン */}
          <label className="block mb-1">カテゴリー選択</label>
          <div className="flex justify-end mb-2">
            <button type="button" onClick={handleSelectAll} className="text-sm sm:text-base mr-2 text-[#fa173d]">
              全て選択
            </button>
            <button type="button" onClick={handleDeselectAll} className="text-sm sm:text-base text-[#fa173d]">
              全て解除
            </button>
          </div>

          {/* カテゴリチェックボックス */}
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
                <span className="truncate whitespace-nowrap overflow-hidden w-full" title={cat.categoryName}>
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

      <button
        type="button" // ★これを追加
        className="w-full py-3 rounded-lg text-white bg-[#fa173d] hover:opacity-90 disabled:opacity-50"
        disabled={loading || !!error}
        onClick={handleStart}
      >
        スタート
      </button>
    </form>
  );
}
