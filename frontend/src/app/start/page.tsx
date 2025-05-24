// frontend/app/start/page.tsx
"use client";

import { useState, FormEvent, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuizContext } from "../context/QuizContext";
import { fetchQuestions } from "../../lib/api";

export default function StartPage() {
  const router = useRouter();
  const { questions, setQuestions } = useContext(QuizContext);

  // 表示用と選択用を分ける
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [numQuestions, setNumQuestions] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);

  // クエリから値を取得（例：?count=10&category=A&category=B）

  const [loading, setLoading] = useState(true);

  // マウント時に一度だけ、APIから問題を取得してContextに登録
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = await fetchQuestions();
        setQuestions(qs);
        // カテゴリ一覧を生成し、すべて選択状態に
        const cats = qs.map((q) => q.category);
        const unique = Array.from(new Set(cats));
        setAvailableCategories(unique);
        setSelectedCategories(unique);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [setQuestions]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const selectAll = () => setSelectedCategories([...availableCategories]);
  const clearAll = () => setSelectedCategories([]);

  const handleStart = (e: FormEvent) => {
    e.preventDefault();
    if (numQuestions <= 0) {
      setError("問題数は1以上の数値を入力してください");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("少なくとも1つのカテゴリを選択してください");
      return;
    }
    setError(null);

    // QuizContext に登録（必要ならここで API 未取得分もセット）
    setQuestions([]); // リセット
    // 選択されたカテゴリだけを questions からフィルタ or API 呼び出しなど

    // クエリパラメータ用意
    const params = new URLSearchParams();
    params.append("count", String(numQuestions));
    selectedCategories.forEach((cat) => params.append("category", cat));

    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleStart}
      className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        出題設定
      </h1>

      {/* ローディング or エラー */}
      {loading && <p className="text-center mb-4">読み込み中…</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* 問題数 */}
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
          disabled={loading}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      {/* カテゴリ選択 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p>カテゴリ選択</p>
          <div>
            <button
              type="button"
              className="text-sm sm:text-base mr-2 text-[#fa173d]"
              onClick={selectAll}
              disabled={loading}
            >
              全て選択
            </button>
            <button
              type="button"
              className="text-sm sm:text-base text-[#fa173d]"
              onClick={clearAll}
              disabled={loading}
            >
              全て解除
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableCategories.map((cat) => (
            <label key={cat} className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                disabled={loading}
                className="mt-1 flex-shrink-0 w-4 h-4"
              />
              <span className="whitespace-normal break-words max-w-full">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* スタートボタン */}
      <button
        type="submit"
        disabled={
          loading || selectedCategories.length === 0 || numQuestions <= 0
        }
        className={`w-full py-3 rounded-lg text-white ${
          loading || selectedCategories.length === 0 || numQuestions <= 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#fa173d] hover:opacity-90"
        }`}
      >
        {loading ? "読み込み中…" : "スタート"}
      </button>
    </form>
  );
}
