// app/result/page.tsx
'use client';

// Next.js がこのページを静的プリレンダーせず、常に動的レンダーする
export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { ResultCard } from '@/components/ResultCard';

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // クエリパラメータから情報を取得
  const answered = Number(searchParams.get('answered') ?? 0);
  const correct  = Number(searchParams.get('correct')  ?? 0);
  const streak   = Number(searchParams.get('streak')   ?? 0);
  const statsJson = searchParams.get('categories');

  const categoryStats: Record<string, { total: number; correct: number }> =
    statsJson ? JSON.parse(statsJson) : {};

  return (
    <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow">
      <ResultCard
        answered={answered}
        correct={correct}
        streak={streak}
        categoryStats={categoryStats}
        onRestart={() => router.push('/start')}
      />
    </div>
  );
}
