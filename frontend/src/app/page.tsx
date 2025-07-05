"use client";

import { useRouter } from "next/navigation";
import type { JSX } from "react";

/**
 * Home コンポーネント
 *
 * QuizSheet のトップページを表示し、
 * 「クイズを始める」ボタンでスタートページへ遷移させる React コンポーネント。
 *
 * @component
 * @returns {JSX.Element} ホームページの UI 要素
 */
export default function Home(): JSX.Element {
  const router = useRouter();

  return (
    <div className="text-center">
      <h1 className="text-2xl mb-4">QuizSheet へようこそ</h1>

      <button
        className="px-6 py-3 bg-[#fa173d] text-white rounded-lg"
        onClick={() => router.push("/start")}
      >
        クイズを始める
      </button>
    </div>
  );
}
