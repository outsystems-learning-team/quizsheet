import { Suspense } from "react";
import ResultClient from "./ResultClient";

/**
 * 結果ページコンポーネント
 * ResultClient を Suspense でラップして表示します。
 * @returns {JSX.Element} 結果ページの UI 要素
 */
export default function ResultPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ResultClient />
    </Suspense>
  );
}
