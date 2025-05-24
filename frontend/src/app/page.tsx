'use client';
import { useRouter } from 'next/navigation';
export default function Home() {
  const router = useRouter();
  return (
    <div className="text-center">
      <h1 className="text-2xl mb-4">QuizSheet へようこそ</h1>
      <button
        className="px-6 py-3 bg-[#fa173d] text-white rounded-lg"
        onClick={() => router.push('/start')}
      >
        クイズを始める
      </button>
    </div>
  );
}