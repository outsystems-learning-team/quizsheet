// frontend/app/start/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const availableCategories = [
  "スコープマネジメント",
  "コストマネジメント",
  "リスクマネジメント",
  "品質マネジメント",
];

export default function StartPage() {
  const router = useRouter();
  const [numQuestions, setNumQuestions] = useState<number>(20);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const selectAll = () => setCategories([...availableCategories]);
  const clearAll = () => setCategories([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (numQuestions <= 0) {
      setError("問題数は1以上の数値を入力してください");
      return;
    }
    if (categories.length === 0) {
      setError("少なくとも1つのカテゴリを選択してください");
      return;
    }
    setError(null);
    const params = new URLSearchParams();
    params.append("count", String(numQuestions));
    categories.forEach((cat) => params.append("category", cat));
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        出題設定
      </h1>

      <div className="mb-4">
        <label
          htmlFor="numQuestions"
          className="block mb-1 text-base sm:text-lg"
        >
          問題数
        </label>
        <input
          id="numQuestions"
          type="number"
          min={1}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className="w-full border border-gray-300 rounded p-2 sm:p-3 text-base sm:text-lg"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-base sm:text-lg">カテゴリ選択</p>
          <div>
            <button
              type="button"
              className="text-sm sm:text-base mr-2 text-[#fa173d]"
              onClick={selectAll}
            >
              全て選択
            </button>
            <button
              type="button"
              className="text-sm sm:text-base text-[#fa173d]"
              onClick={clearAll}
            >
              全て解除
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableCategories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                checked={categories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
              <span className="text-base sm:text-lg">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
      )}

      <button
        type="submit"
        disabled={categories.length === 0 || numQuestions <= 0}
        className={
          `w-full py-3 sm:py-4 rounded-lg text-white transition font-medium text-lg sm:text-xl ` +
          (categories.length === 0 || numQuestions <= 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#fa173d]")
        }
      >
        スタート
      </button>
    </form>
  );
}
