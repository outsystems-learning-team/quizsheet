'use client';

import { useState } from 'react';

export default function SqlTestPage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('クライアント変数');

  const fetchData = async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: unknown = await response.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SQL Execution Test Page</h1>
      <div className="space-y-4">
        <div>
          <button
            onClick={() => fetchData('/api/categories')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Fetch Categories
          </button>
        </div>
        <div>
          <button
            onClick={() => fetchData('/api/quiz-names')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Fetch Quiz Names
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-border-color p-2 rounded w-full"
            placeholder="Enter category"
          />
          <button
            onClick={() => fetchData(`/api/quizzes?category=${encodeURIComponent(category)}`)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
          >
            Fetch Quizzes by Category
          </button>
        </div>
        <div>
          <button
            onClick={() => fetchData('/api/users')}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Fetch Users
          </button>
        </div>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      {result !== null && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Result:</h2>
          <pre className="bg-primary-bg p-4 rounded mt-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
