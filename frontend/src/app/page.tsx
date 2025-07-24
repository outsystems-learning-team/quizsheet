'use client';

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { QuizContext } from "@/context/QuizContext";

/**
 * スタートページコンポーネント
 * クイズの開始設定（問題数、シート、カテゴリ選択）を提供します。
 * @returns {JSX.Element} スタートページの UI 要素
 */
export default function StartPage() {
  const router = useRouter();

  /* ------------------------------  state  ------------------------------ */
  const [, setError] = useState<string | null>(null);
  const { setIsLoading, resetQuizState } = useContext(QuizContext);

  /* ----------------------------  fetch once  --------------------------- */
  useEffect(() => {
    // コンポーネントがマウントされたときに結果関連のstateをリセット
    resetQuizState();
  }, [setIsLoading, resetQuizState, setError]);

  /* ---------------------------  form submit  --------------------------- */

  /* ------------------------------  view  ------------------------------- */
  return (
    <div
          className="max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        問題を開始
        </h1>
        <h3 className="text-2xl sm:text-2xl font-bold mb-4 text-center">
          出題方法方法を選択
        </h3>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <button
          type="button"
          className="w-full py-3 rounded-lg text-white bg-[#fa173d] hover:opacity-90 disabled:opacity-50"
          onClick={()=>router.push('/start')}>
          カテゴリー選択
        </button>
        <button
          type="button"
          className="w-full py-3 rounded-lg text-white bg-[#fa173d] hover:opacity-90 disabled:opacity-50"
          onClick={()=>router.push('/select')}>
          問題選択
        </button>
      </div>
    </div>
  )
}
