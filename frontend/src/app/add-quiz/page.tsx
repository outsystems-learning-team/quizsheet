"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/LoadingOverlay";
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const [quizNames, setQuizNames] = useState<QuizName[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [targetSheet, setTargetSheet] = useState('');
  
  const [quizzes, setQuizzes] = useState<Question[]>([]);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const [quiz, setQuiz] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
    category: "",
    newCategory: "",
  });

  // Fetch quiz names on initial load
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
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch categories and quizzes when targetSheet changes
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      setFilterCategory(''); // Reset category filter on change

      try {
        // Fetch quizzes based on the selected targetSheet
        const quizQuery = targetSheet ? `quiz_name=${encodeURIComponent(targetSheet)}` : '';
        const quizzesRes = await fetch(`/api/quizzes?${quizQuery}`);
        if (!quizzesRes.ok) throw new Error(`Failed to fetch quizzes: ${quizzesRes.statusText}`);
        const quizzesData: Question[] = await quizzesRes.json();
        setQuizzes(quizzesData);

        // Fetch categories only if a targetSheet is selected
        if (targetSheet) {
          const categoriesRes = await fetch(`/api/categories?quiz_name=${encodeURIComponent(targetSheet)}`);
          if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
          const categoriesData: Category[] = await categoriesRes.json();
          setCategories(categoriesData);
        } else {
          setCategories([]); // Clear categories if no sheet is selected
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました。");
        setQuizzes([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [targetSheet]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...quiz.options];
    newOptions[index] = value;
    setQuiz((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setQuiz((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const removeOption = (index: number) => {
    const newOptions = quiz.options.filter((_, i) => i !== index);
    setQuiz((prev) => ({ ...prev, options: newOptions }));
  };
  
  const resetForm = () => {
    setEditingQuizId(null);
    setQuiz({
      question: "",
      options: ["", "", "", ""],
      answer: "",
      explanation: "",
      category: "",
      newCategory: "",
    });
    setIsModalOpen(false);
  };

  const handleEdit = (targetQuiz: Question) => {
    setEditingQuizId(targetQuiz.id);
    setQuiz({
      question: targetQuiz.question,
      options: [...targetQuiz.choices, "", "", "", ""].slice(0, 4),
      answer: targetQuiz.choices[targetQuiz.answerIndex],
      explanation: targetQuiz.explanation,
      category: targetQuiz.category,
      newCategory: "",
    });
    setIsModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const finalCategory = quiz.newCategory.trim() !== '' ? quiz.newCategory : quiz.category;
    const answerIndex = quiz.options.findIndex(opt => opt === quiz.answer);

    if (
      !quiz.question ||
      quiz.options.some((opt) => !opt) ||
      !quiz.answer ||
      answerIndex === -1 ||
      !quiz.explanation ||
      !targetSheet ||
      !finalCategory
    ) {
      setError("すべての項目を正しく入力してください。正解が選択肢に含まれているか確認してください。");
      setIsLoading(false);
      return;
    }
    
    const requestBody = {
      category: finalCategory,
      question: quiz.question,
      choices: quiz.options.filter(opt => opt.trim() !== ''),
      answer: quiz.answer,
      explanation: quiz.explanation,
    };

    try {
      let res;
      if (editingQuizId) {
        // Update existing quiz
        res = await fetch(`/api/quiz/${editingQuizId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
      } else {
        // Add new quiz
        res = await fetch('/api/add-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...requestBody, targetSheet }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "APIエラーが発生しました。");
      }
      
      alert(editingQuizId ? "問題が正常に更新されました！" : "問題が正常に追加されました！");
      resetForm();
      setIsModalOpen(false);
      // Refresh quiz list
      const quizzesRes = await fetch(`/api/quizzes?quiz_name=${encodeURIComponent(targetSheet)}&categories=${categories.map(c => c.category_name).join(',')}`);
      const quizzesData = await quizzesRes.json();
      setQuizzes(quizzesData);

    } catch (err) {
      setError(err instanceof Error ? err.message : "問題の保存に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [quiz, router, targetSheet, editingQuizId, categories]);


  return (
    <div className="max-w-7xl mx-auto p-8 bg-primary-bg shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center">問題管理ダッシュボード</h1>

      {/* Top-level Quiz Selection */}
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
          <option value="">すべてのクイズを表示</option>
          {quizNames.map((q) => (
            <option key={q.id} value={q.quiz_name}>
              {q.quiz_name_jp}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons and Filters */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
          disabled={!targetSheet} // Disable if no quiz is selected
        >
          新しい問題を追加
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={resetForm}
        >
          <div
            className="bg-secondary-bg p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">{editingQuizId ? "問題を編集" : "新しい問題を追加"}</h2>
              {error && <p className="text-red-500 text-center">{error}</p>}

              {/* Form content remains the same... */}
              <div>
                <label className="block text-lg font-medium mb-2">選択肢</label>
                {quiz.options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md"
                      placeholder={`選択肢 ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="answer" className="block text-lg font-medium mb-2">
                  正解
                </label>
                <select
                  id="answer"
                  name="answer"
                  value={quiz.answer}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md"
                  required
                >
                  <option value="">正解の選択肢を選択...</option>
                  {quiz.options.filter(opt => opt).map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="explanation" className="block text-lg font-medium mb-2">
                  解説
                </label>
                <textarea
                  id="explanation"
                  name="explanation"
                  value={quiz.explanation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-lg font-medium mb-2">
                  既存カテゴリを選択
                </label>
                <select
                  id="category"
                  name="category"
                  value={quiz.category}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md"
                  disabled={!targetSheet}
                >
                  <option value="">カテゴリを選択しない</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.category_name}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-4 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                  disabled={isLoading}
                >
                  {editingQuizId ? "問題を更新する" : "問題を追加する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-center">既存の問題リスト</h2>

        <div className="mb-4">
          <label htmlFor="filterCategory" className="block text-lg font-medium mb-2">
            カテゴリで絞り込み
          </label>
          <select
            id="filterCategory"
            name="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full p-3 bg-secondary-bg border border-gray-600 rounded-md"
          >
            <option value="">すべてのカテゴリ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.category_name}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {quizzes
            .filter(q => !filterCategory || q.category === filterCategory)
            .map((q) => (
            <div key={q.id} className="p-4 bg-secondary-bg rounded-lg shadow">
              <p className="font-semibold text-lg">{q.question}</p>
              <p className="text-sm text-gray-500">ID: {q.id}</p>
              <p className="text-sm text-gray-400">カテゴリ: {q.category}</p>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => handleEdit(q)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  修正
                </button>
                
              </div>
            </div>
          ))}
        </div>
      </div>

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
