"use client";

import { FormEvent, JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuizSetup } from "../../hooks/useQuizSetup";
import { CategorySelector } from "../../components/CategorySelector";

/**
 * 出題設定ページコンポーネント
 *
 * - 問題数とカテゴリをユーザーが選択可能
 * - 選択条件に従いクイズページへ遷移
 *
 * @returns {JSX.Element} 出題設定フォームの JSX
 */
export default function StartPage(): JSX.Element {
  // Next.js のルーターを取得（プログラム的ページ遷移用）
  const router = useRouter();

  // カスタムフックから取得するステートと操作関数
  const {
    loading,              // データ読み込み中フラグ
    error,                // エラーメッセージ
    availableCategories,  // 利用可能なカテゴリ一覧
    selectedCategories,   // ユーザーが選択したカテゴリ一覧
    toggleCategory,       // カテゴリ選択/解除トグル関数
    selectAll,            // 全カテゴリを選択する関数
    clearAll,             // 全カテゴリ選択解除関数
  } = useQuizSetup();

  // ユーザー入力による出題数ステート（デフォルト20問）
  const [numQuestions, setNumQuestions] = useState<number>(20);

  /**
   * 「スタート」ボタン押下時のフォーム送信ハンドラ
   *
   * - バリデーション：問題数が1以上／カテゴリが1つ以上
   * - クエリパラメータを生成して `/quiz` ページへ遷移
   *
   * @param {FormEvent} e - フォーム送信イベント
   */
  const handleStart = (e: FormEvent) => {
    e.preventDefault();
    // 問題数バリデーション
    if (numQuestions <= 0) return;
    // カテゴリ選択バリデーション
    if (selectedCategories.length === 0) return;
    // クエリパラメータ生成
    const params = new URLSearchParams();
    params.append("count", String(numQuestions));
    selectedCategories.forEach((cat) => params.append("category", cat));
    // クイズページへ遷移
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    // フォーム全体のレイアウト設定
    <form
      onSubmit={handleStart}
      className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow"
    >
      {/* タイトル */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        出題設定
      </h1>

      {/* 読み込み中メッセージ */}
      {loading && <p className="text-center mb-4">読み込み中…</p>}
      {/* エラーメッセージ */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

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
          disabled={loading}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      {/* カテゴリ選択コンポーネント */}
      <CategorySelector
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        loading={loading}
        selectAll={selectAll}
        clearAll={clearAll}
      />

      {/* スタートボタン */}
      <button
        type="submit"
        disabled={loading || selectedCategories.length === 0 || numQuestions <= 0}
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
