import QuizClient from "./QuizClient";
import { Suspense } from "react";

/**
 * クイズページコンポーネント
 * QuizClient を Suspense でラップして表示します。
 * @returns {JSX.Element} クイズページの UI 要素
 */
export default function QuizPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <QuizClient />
    </Suspense>
  );
}
