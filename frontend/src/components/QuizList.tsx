import type { Question } from "@shared/types";

interface QuizListProps {
  quizzes: Question[];
  filterCategory: string;
  categories: { id: number; category_name: string }[];
  onFilterChange: (category: string) => void;
  onEdit: (quiz: Question) => void;
  onDelete: (quizId: number) => void;
}

export default function QuizList({ quizzes, filterCategory, categories, onFilterChange, onEdit, onDelete }: QuizListProps) {
  return (
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
          onChange={(e) => onFilterChange(e.target.value)}
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
                onClick={() => onEdit(q)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                修正
              </button>
              <button
                onClick={() => onDelete(q.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
