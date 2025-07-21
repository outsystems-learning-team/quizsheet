import { useState, useCallback, useEffect } from "react";
import type { Question } from "@shared/types";

interface QuizFormProps {
  categories: { id: number; category_name: string }[];
  targetSheet: string;
  editingQuiz: Question | null;
  onQuizSaved: () => void;
  onCancel: () => void;
}

export default function QuizForm({ categories, targetSheet, editingQuiz, onQuizSaved, onCancel }: QuizFormProps) {
  const [quiz, setQuiz] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
    category: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingQuiz) {
      setQuiz({
        question: editingQuiz.question,
        options: [...editingQuiz.choices, "", "", "", ""].slice(0, 4),
        answer: editingQuiz.choices[editingQuiz.answerIndex],
        explanation: editingQuiz.explanation,
        category: editingQuiz.category,
      });
    } else {
      setQuiz({
        question: "",
        options: ["", "", "", ""],
        answer: "",
        explanation: "",
        category: "",
      });
    }
  }, [editingQuiz]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...quiz.options];
    const oldOptionValue = quiz.options[index];
    newOptions[index] = value;

    setQuiz((prev) => ({
      ...prev,
      options: newOptions,
      answer: prev.answer === oldOptionValue ? "" : prev.answer,
    }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!window.confirm(editingQuiz ? "問題を更新します。よろしいですか？" : "問題を追加します。よろしいですか？")) {
      setIsLoading(false);
      return;
    }

    const finalCategory = quiz.category;
    const filledOptions = quiz.options.filter(opt => opt.trim() !== '');
    const answerIndex = filledOptions.findIndex(opt => opt === quiz.answer);

    if (
      !quiz.question ||
      filledOptions.length < 2 ||
      !quiz.answer ||
      answerIndex === -1 ||
      !quiz.explanation ||
      !targetSheet ||
      !finalCategory
    ) {
      setError("すべての項目を正しく入力してください。選択肢は2つ以上入力し、正解が選択肢に含まれているか確認してください。");
      setIsLoading(false);
      return;
    }

    try {
      let res;
      if (editingQuiz) {
        const putBody = {
          category: finalCategory,
          question: quiz.question,
          choices: filledOptions,
          answerIndex: answerIndex,
          explanation: quiz.explanation,
        };
        res = await fetch(`/api/quiz/${editingQuiz.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(putBody),
        });
      } else {
        const postBody = {
          targetSheet,
          category: finalCategory,
          question: quiz.question,
          choices: filledOptions,
          answer: quiz.answer,
          explanation: quiz.explanation,
        };
        res = await fetch('/api/add-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postBody),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "APIエラーが発生しました。");
      }
      
      alert(editingQuiz ? "問題が正常に更新されました！" : "問題が正常に追加されました！");
      onQuizSaved();

    } catch (err) {
      setError(err instanceof Error ? err.message : "問題の保存に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [quiz, targetSheet, editingQuiz, onQuizSaved]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-secondary-bg p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">{editingQuiz ? "問題を編集" : "新しい問題を追加"}</h2>
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div>
            <label htmlFor="question" className="block text-lg font-medium mb-2">問題文</label>
            <textarea id="question" name="question" value={quiz.question} onChange={handleInputChange} rows={3} className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md" required />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">選択肢</label>
            {quiz.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input type="text" value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md" placeholder={`選択肢 ${index + 1}`} />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="answer" className="block text-lg font-medium mb-2">正解</label>
            <select id="answer" name="answer" value={quiz.answer} onChange={handleInputChange} className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md" required>
              <option value="">正解の選択肢を選択...</option>
              {quiz.options.filter(opt => opt).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="explanation" className="block text-lg font-medium mb-2">解説</label>
            <textarea id="explanation" name="explanation" value={quiz.explanation} onChange={handleInputChange} rows={4} className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md" required />
          </div>

          <div>
            <label htmlFor="category" className="block text-lg font-medium mb-2">既存カテゴリを選択</label>
            <select id="category" name="category" value={quiz.category} onChange={handleInputChange} className="w-full p-3 bg-primary-bg border border-gray-600 rounded-md" disabled={!targetSheet}>
              <option value="">カテゴリを選択しない</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
              ))}
            </select>
          </div>

          

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="py-2 px-4 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">キャンセル</button>
            <button type="submit" className="py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors" disabled={isLoading}>{editingQuiz ? "問題を更新する" : "問題を追加する"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}