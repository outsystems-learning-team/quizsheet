// app/result/page.tsx
import { Suspense } from "react";
import ResultClient from "./ResultClient";

// 静的プリレンダーをオフに
export const dynamic = "force-dynamic";

export default function ResultPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ResultClient />
    </Suspense>
  );
}
