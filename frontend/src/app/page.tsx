'use client';

import { useRouter } from 'next/navigation';
import { JSX } from 'react';

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
  // Next.js の useRouter フックを取得
  // push メソッドで別ページへのプログラム的な遷移が可能
  const router = useRouter();

  return (
    // ページ全体を中央寄せにするコンテナ
    <div className="text-center">
      {/* ページタイトル */}
      <h1 className="text-2xl mb-4">QuizSheet へようこそ</h1>

      {/* クイズ開始ボタン */}
      <button
        className="px-6 py-3 bg-[#fa173d] text-white rounded-lg"
        // クリック時に /start ルートへ遷移
        onClick={() => router.push('/start')}
      >
        クイズを始める
      </button>
    </div>
  );
}
