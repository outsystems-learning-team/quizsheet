'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // useSessionをインポート

interface CategoryAccuracy {
  category: string;
  accuracy: number; // 0.0 から 1.0 の値
}

interface QuizName {
  id: number;
  quiz_name: string;
  quiz_name_jp: string;
}

export default function CategoryAccuracyHeatmap() {
  const { data: session } = useSession(); // session情報を取得
  const [data, setData] = useState<CategoryAccuracy[]>([]);
  const [quizNames, setQuizNames] = useState<QuizName[]>([]);
  const [selectedQuizName, setSelectedQuizName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizNames() {
      try {
        const response = await fetch('/api/quiz-names');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: QuizName[] = await response.json();
        setQuizNames(result);
        if (result.length > 0) {
          setSelectedQuizName(result[0].quiz_name);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    }
    fetchQuizNames();
  }, []);

  useEffect(() => {
    async function fetchData() {
      // ログインしていない、または問題集が選択されていない場合は処理を中断
      if (!session || !selectedQuizName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/user-progress/category-accuracy?quiz_name=${encodeURIComponent(selectedQuizName)}`);
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('ログインが必要です。');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: CategoryAccuracy[] = await response.json();
        setData(result);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedQuizName, session]); // sessionを依存配列に追加

  const getColor = (accuracy: number) => {
    const hue = accuracy * 120;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleResetAccuracy = async () => {
    if (window.confirm('本当に正答率データをリセットしますか？この操作は元に戻せません。')) {
      try {
        setLoading(true);
        const response = await fetch('/api/user-progress/reset-accuracy', {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // リセット後、データを再フェッチして表示を更新
        // selectedQuizName が変更されたとみなして useEffect をトリガー
        setSelectedQuizName(''); // 一度空にしてから元に戻すことで useEffect を強制的に再実行
        setTimeout(() => setSelectedQuizName(quizNames[0]?.quiz_name || ''), 0);
        alert('正答率データがリセットされました。');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
        alert(`リセットに失敗しました: ${e instanceof Error ? e.message : "不明なエラー"}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // ログインしていない場合の表示
  if (!session) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">カテゴリ別正答率ヒートマップ</h2>
        <p>学習進捗を確認するには、ログインしてください。</p>
      </div>
    );
  }
  
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">カテゴリ別正答率ヒートマップ</h2>
      <div className="mb-4 flex items-end justify-between"> 
        <div className="flex-grow mr-4"> 
          <label htmlFor="quiz-name-select" className="block mb-1">
            問題集を選択:
          </label>
          <select
            id="quiz-name-select"
            value={selectedQuizName}
            onChange={(e) => setSelectedQuizName(e.target.value)}
            className="w-full border border-foreground rounded p-2"
          >
            {quizNames.map((quiz) => (
              <option key={quiz.id} value={quiz.quiz_name}>
                {quiz.quiz_name_jp || quiz.quiz_name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleResetAccuracy}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors whitespace-nowrap"
          disabled={loading}
        >
          正答率をリセット
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading heatmap data...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-4">この問題集の回答履歴がまだありません。</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((item) => (
            <div
              key={item.category}
              className="p-4 rounded-lg text-white font-bold flex flex-col items-center justify-center"
              style={{ backgroundColor: getColor(item.accuracy) }}
            >
              <span className="text-lg">{item.category}</span>
              <span className="text-2xl mt-2">{(item.accuracy * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 text-sm text-gray-600">
        <p>正答率が低いほど赤色に、高いほど緑色に表示されます。</p>
      </div>
    </div>
  );
}
