"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import type { Question } from "@/types/quiz";

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
  const [preview, setPreview] = useState(false);

  const [quizNames, setQuizNames] = useState<QuizName[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [targetSheet, setTargetSheet] = useState('');
  
  const [quizzes, setQuizzes] = useState<Question[]>([]);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

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
    if (!targetSheet) return;

    const fetchCategoriesAndQuizzes = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesRes = await fetch(`/api/categories?quiz_name=${encodeURIComponent(targetSheet)}`);
        if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
        const categoriesData: Category[] = await categoriesRes.json();
        setCategories(categoriesData);
        setQuiz(prev => ({ ...prev, category: '' }));

        // Fetch quizzes
        const quizzesRes = await fetch(`/api/quizzes?quiz_name=${encodeURIComponent(targetSheet)}&categories=${categoriesData.map(c => c.category_name).join(',')}`);
        if (!quizzesRes.ok) throw new Error(`Failed to fetch quizzes: ${quizzesRes.statusText}`);
        const quizzesData: Question[] = await quizzesRes.json();
        setQuizzes(quizzesData);

      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndQuizzes();
  }, [targetSheet]);


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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (quizId: number) => {
    if (!window.confirm("本当にこの問題を削除しますか？")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/quiz/${quizId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "削除に失敗しました。");
      }
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
      alert("問題を削除しました。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const finalCategory = quiz.category === 'new' ? quiz.newCategory : quiz.category;
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
      answerIndex: answerIndex,
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
    <div className="max-w-4xl mx-auto p-8 bg-primary-bg shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">{editingQuizId ? "問題を編集" : "新しい問題を追加"}</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setPreview(!preview)}
          className="px-4 py-2 bg-secondary-bg text-primary-text rounded hover:opacity-80"
        >
          {preview ? "編集に戻る" : "プレビュー"}
        </button>
      </div>

      {preview ? (
        <div className="border p-6 rounded-md bg-secondary-bg">
          <h2 className="text-xl font-semibold mb-4">{quiz.question}</h2>
          <div className="space-y-2">
            {quiz.options.map((option, index) => (
              <div key={index} className={`p-3 bg-primary-bg rounded ${quiz.answer === option ? 'ring-2 ring-green-500' : ''}`}>
                {option}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p><span className="font-bold">正解:</span> {quiz.answer}</p>
            <p className="mt-2"><span className="font-bold">解説:</span> {quiz.explanation}</p>
            <p className="mt-2"><span className="font-bold">カテゴリ:</span> {quiz.category === 'new' ? quiz.newCategory : quiz.category}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div>
            <label htmlFor="targetSheet" className="block text-lg font-medium mb-2">
              対象クイズ
            </label>
            <select
              id="targetSheet"
              name="targetSheet"
              value={targetSheet}
              onChange={(e) => setTargetSheet(e.target.value)}
              className="w-full p-3 bg-secondary-bg border border-gray-600 rounded-md"
              required
            >
              <option value="">クイズを選択...</option>
              {quizNames.map((q) => (
                <option key={q.id} value={q.quiz_name}>
                  {q.quiz_name_jp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="question" className="block text-lg font-medium mb-2">
              問題文
            </label>
            <textarea
              id="question"
              name="question"
              value={quiz.question}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 bg-secondary-bg border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">選択肢</label>
            {quiz.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full p-3 bg-secondary-bg border border-gray-600 rounded-md"
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
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              選択肢を追加
            </button>
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
              className="w-full p-3 bg-secondary-bg border border-gray-600 rounded-md"
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
              className="w-full p-3 bg-secondary-bg border border-gray-600 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-lg font-medium mb-2">
              カテゴリ
            </label>
            <select
              id="category"
              name="category"
              value={quiz.category}
              onChange={handleInputChange}
              className="w-full p-3 bg-secondary-bg border border-gray-600 rounded-md"
              disabled={!targetSheet}
            >
              <option value="">カテゴリを選択</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.category_name}>
                  {cat.category_name}
                </option>
              ))}
              <option value="new">新しいカテゴリを作成</option>
            </select>

            {quiz.category === "new" && (
              <input
                type="text"
                name="newCategory"
                value={quiz.newCategory}
                onChange={handleInputChange}
                className="w-full mt-2 p-3 bg-secondary-bg border border-gray-600 rounded-md"
                placeholder="新しいカテゴリ名"
                required
              />
            )}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              type="submit"
              className="w-full max-w-xs py-3 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              disabled={isLoading}
            >
              {editingQuizId ? "問題を更新する" : "問題を追加する"}
            </button>
            {editingQuizId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full max-w-xs py-3 px-6 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
            )}
          </div>
        </form>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-center">既存の問題リスト</h2>
        <div className="space-y-4">
          {quizzes.map((q) => (
            <div key={q.id} className="p-4 bg-secondary-bg rounded-lg shadow">
              <p className="font-semibold text-lg">{q.question}</p>
              <p className="text-sm text-gray-400">カテゴリ: {q.category}</p>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => handleEdit(q)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  修正
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isLoading && <LoadingOverlay />}
    </div>
  );
}
