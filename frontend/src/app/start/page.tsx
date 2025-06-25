"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SheetNameList, CategoryNameList } from "@shared/types"; // 共有型があれば
import { fetchQuizApi } from "../../lib/api";

export default function StartPage() {
  const router = useRouter();

  /* ------------------------------  state  ------------------------------ */
  const [numQuestions, setNumQuestions] = useState(20);
  const [sheets, setSheets] = useState<SheetNameList[]>([]);
  const [categories, setCategories] = useState<CategoryNameList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------  fetch once  --------------------------- */
  useEffect(() => {
    /** ステップ① シート一覧 → ステップ② カテゴリ一覧 */
    const load = async () => {
      try {
        // ① シート一覧取得
        const sheetList = await fetchQuizApi<SheetNameList[]>({
          key: "sheet_name_list",
        });
        setSheets(sheetList);

        // ② 先頭シートのカテゴリ取得（シートが存在する場合のみ）
        if (sheetList.length) {
          const catList = await fetchQuizApi<CategoryNameList[]>({
            key: "category_list",
            targetSheet: sheetList[0].sheetName,
          });
          setCategories(catList);
        }

        setError(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------------------  form submit  --------------------------- */
  const handleStart = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/quiz?num=${numQuestions}`); // 必要に応じて他クエリ追加
  };

  /* ------------------------------  view  ------------------------------- */
  return (
    <form
      onSubmit={handleStart}
      className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        出題設定
      </h1>

      {/* 取得中/エラー表示 */}
      {loading && <p className="mb-4 text-center">ロード中...</p>}
      {error && <p className="mb-4 text-red-500 text-center">{error}</p>}

      {/* シート選択 — 例としてセレクトを追加 */}
      {!loading && !error && (
        <div className="mb-4">
          <label className="block mb-1">対象シート</label>
          <select className="w-full border rounded p-2">
            {sheets.map((s) => (
              <option key={s.id} value={String(s.sheetName)}>
                {s.text}
              </option>
            ))}
          </select>
        </div>
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
        type="submit"
        className="w-full py-3 rounded-lg text-white bg-[#fa173d] hover:opacity-90 disabled:opacity-50"
        disabled={loading || !!error}
      >
        スタート
      </button>
    </form>
  );
}
