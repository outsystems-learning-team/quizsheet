// frontend/app/quiz/page.tsx
import QuizClient from "./QuizClient";
import { Suspense } from "react";

export default function QuizPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <QuizClient />
    </Suspense>
  );
}
