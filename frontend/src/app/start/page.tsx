"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SheetNameList } from "@shared/types"; // 共有型があれば
import { SPREAD_SHEET_NAME_LIST } from "@shared/constants"; // 共有型があれば

export default function StartPage() {
  const router = useRouter();

  /* ------------------------------  state  ------------------------------ */
  const [numQuestions, setNumQuestions] = useState(20);
  const [sheets, setSheets] = useState<SheetNameList[]>([]); // ← 取得したシート一覧
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------  fetch once  --------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "sheet_name_list" }),
        });

        const json = await res.json();

        if (json.status === "ok") {
          setSheets(json.data); // [{ id, sheetName, text }, …]
          setError(null);
        } else {
          throw new Error(json.message);
        }
      } catch (e: any) {
        setError(e.message ?? "Failed to fetch sheet list");
      } finally {
        setLoading(false);
      }
    })();
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
