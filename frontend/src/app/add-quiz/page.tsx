"use client";

import { useState, useCallback, useEffect } from "react";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import QuizForm from "@/components/QuizForm";
import QuizList from "@/components/QuizList";
import type { Question } from "@shared/types";

interface QuizName {
  id: number;
  quiz_name: string;
  quiz_name_jp: string;
}

interface Category {
  id: number;
  category_name: string;
}

export default function AddQuizPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const [quizNames, setQuizNames] = useState<QuizName[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [targetSheet, setTargetSheet] = useState('');
  
  const [quizzes, setQuizzes] = useState<Question[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<Question | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchQuizzes = useCallback(async (sheet: string) => {
    setIsLoading(true);
    try {
      const quizQuery = sheet ? `quiz_name=${encodeURIComponent(sheet)}` : '';
      const quizzesRes = await fetch(`/api/quizzes?${quizQuery}`);
      if (!quizzesRes.ok) throw new Error(`Failed to fetch quizzes: ${quizzesRes.statusText}`);
      const quizzesData: Question[] = await quizzesRes.json();
      setQuizzes(quizzesData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "クイズの取得に失敗しました。");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const quizNamesRes = await fetch('/api/quiz-names');
        if (!quizNamesRes.ok) throw new Error(`Failed to fetch quiz names: ${quizNamesRes.statusText}`);
        const quizNamesData: QuizName[] = await quizNamesRes.json();
        setQuizNames(quizNamesData);
        if (quizNamesData.length > 0) {
          setTargetSheet(quizNamesData[0].quiz_name);
          fetchQuizzes(quizNamesData[0].quiz_name);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "初期データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchQuizzes]);

  useEffect(() => {
    if (targetSheet) {
      const fetchCategories = async () => {
        try {
          const categoriesRes = await fetch(`/api/categories?quiz_name=${encodeURIComponent(targetSheet)}`);
          if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
          const categoriesData: Category[] = await categoriesRes.json();
          setCategories(categoriesData);
        } catch (e) {
          setError(e instanceof Error ? e.message : "カテゴリの取得に失敗しました。");
        }
      };
      fetchCategories();
      fetchQuizzes(targetSheet);
    }
  }, [targetSheet, fetchQuizzes]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEdit = (quiz: Question) => {
    setEditingQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleDelete = async (quizId: number) => {
    if (window.confirm("この問題を削除してもよろしいですか？")) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/quiz/${quizId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("問題の削除に失敗しました。");
        alert("問題を削除しました。");
        fetchQuizzes(targetSheet);
      } catch (err) {
        setError(err instanceof Error ? err.message : "問題の削除中にエラーが発生しました。");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuizSaved = () => {
    setIsModalOpen(false);
    setEditingQuiz(null);
    fetchQuizzes(targetSheet);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-primary-bg shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center">問題管理ダッシュボード</h1>

      <div className="mb-8">
        <label htmlFor="targetSheet" className="block text-xl font-semibold mb-3">
          対象クイズの選択
        </label>
        <select
          id="targetSheet"
          name="targetSheet"
          value={targetSheet}
          onChange={(e) => setTargetSheet(e.target.value)}
          className="w-full p-4 bg-secondary-bg border border-gray-600 rounded-md text-lg"
        >
          {quizNames.map((q) => (
            <option key={q.id} value={q.quiz_name}>
              {q.quiz_name_jp}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            setEditingQuiz(null);
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
          disabled={!targetSheet}
        >
          新しい問題を追加
        </button>
      </div>

      {isModalOpen && (
        <QuizForm
          categories={categories}
          targetSheet={targetSheet}
          editingQuiz={editingQuiz}
          onQuizSaved={handleQuizSaved}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingQuiz(null);
          }}
        />
      )}

      <QuizList
        quizzes={quizzes}
        filterCategory={filterCategory}
        categories={categories}
        onFilterChange={setFilterCategory}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isLoading && <LoadingOverlay />}

      {showTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-opacity duration-300"
        >
          ↑
        </button>
      )}
    </div>
  );
}