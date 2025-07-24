"use client";

import { ChangeEvent, useContext, useEffect, useState, useRef,FC, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { QuizContext } from "@/context/QuizContext";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { Question } from "@shared/types";

// 型定義を修正
interface QuizName {
  id: number;
  quiz_name: string;
  quiz_name_jp: string;
}

interface Category {
  id: number; // idを追加
  category_name: string;
}

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  isChecked: boolean;
  onCheckboxChange: () => void;
}

export default function SelectPage() {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // /start/page.tsxから流用
    const [selectedNumQuestionsOption, ] = useState<string>("20");
    const selectedNumQuestionsOptionRef = useRef(selectedNumQuestionsOption);
    useEffect(() => { selectedNumQuestionsOptionRef.current = selectedNumQuestionsOption; }, [selectedNumQuestionsOption]);
   
    const [quizNames, setQuizNames] = useState<QuizName[]>([]); // sheets -> quizNames
    const [, setCategories] = useState<Category[]>([]);
    const [, setSelectedCategories] = useState<string[]>([]);
    const [activeQuizName, setActiveQuizName] = useState<string>(""); // activeSheet -> activeQuizName
    const { questions,setQuestions, isLoading, setIsLoading, setAnsweredCount, setCorrectCount, setStreak, setCategoryStats, setIncorrectQuestions, resetQuizState } = useContext(QuizContext); // eslint-disable-line @typescript-eslint/no-unused-vars
  
  useEffect(() => {
    // コンポーネントがマウントされたときに結果関連のstateをリセット
    resetQuizState();
    setSelectedIds([]);

    (async () => {
      setIsLoading(true);
      try {
        // クイズ名リストの取得
        const quizNamesRes = await fetch('/api/quiz-names');
        if (!quizNamesRes.ok) throw new Error(`Failed to fetch quiz names: ${quizNamesRes.statusText}`);
        const quizNamesData: QuizName[] = await quizNamesRes.json();
        setQuizNames(quizNamesData);

        if (quizNamesData.length > 0) {
          setActiveQuizName(quizNamesData[0].quiz_name);
          // カテゴリリストの取得
          const categoriesRes = await fetch(`/api/categories?quiz_name=${encodeURIComponent(quizNamesData[0].quiz_name)}`);
          if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
          const categoriesData: Category[] = await categoriesRes.json();
          setCategories(categoriesData);

          // カテゴリー名のリストを作成
          const categoryNames = categoriesData.map(category => category.category_name);
          // 問題の取得
          const quizzesRes = await fetch(`/api/quizzes?quiz_name=${encodeURIComponent(quizNamesData[0].quiz_name)}&categories=${encodeURIComponent(categoryNames.join(','))}`);
          if (!quizzesRes.ok) {
            const errorText = await quizzesRes.text(); // Read response body as text for more info
            throw new Error(`Failed to fetch quizzes: ${quizzesRes.status} ${quizzesRes.statusText} - ${errorText}`);
          }          
          const questions: Question[] = await quizzesRes.json();
          setQuestions(questions);
          if (!Array.isArray(questions)) { // Explicitly check if it's an array
            throw new Error("API response is not an array of questions.");
          }
        }
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [setIsLoading, resetQuizState, setQuizNames, setCategories, setError, setQuestions]);

// チェックボックスのトグル
  const handleCheckboxChange = (questionId: number) => {
    setSelectedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // 問題の再取得
  const handleQuizNameChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const quizName = e.target.value;
    setActiveQuizName(quizName);
    setSelectedCategories([]);
    setSelectedIds([]);

    setIsLoading(true);
    try {
      // カテゴリリストの再取得
      const categoriesRes = await fetch(`/api/categories?quiz_name=${encodeURIComponent(quizName)}`);
      if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.statusText}`);
      const categoriesData: Category[] = await categoriesRes.json();
      setCategories(categoriesData);

      const categoryNames = categoriesData.map(category => category.category_name);
      const quizzesRes = await fetch(`/api/quizzes?quiz_name=${encodeURIComponent(quizName)}&categories=${encodeURIComponent(categoryNames.join(','))}`);
      if (!quizzesRes.ok) {
        const errorText = await quizzesRes.text(); // Read response body as text for more info
        throw new Error(`Failed to fetch quizzes: ${quizzesRes.status} ${quizzesRes.statusText} - ${errorText}`);
      }          
      const questions: Question[] = await quizzesRes.json();
      setQuestions(questions);

    } catch (e) {
      setError(
        `問題取得に失敗しました: ${e instanceof Error ? e.message : "不明なエラー"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };


  // 全選択
  const handleSelectAll = () => {
    setSelectedIds(questions.map((q) => q.id));
  };

  // 全解除
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // クイズスタート
  const handleStartQuiz = (event?: React.FormEvent) => {
  if (event) {
    event.preventDefault(); 
  }
  setIsLoading(true); 
  const filtered = questions.filter((q) => selectedIds.includes(q.id));

  if (filtered.length === 0) {
    setError("問題が選択されていません");
    setIsLoading(false);
    return;
  }
  setQuestions(filtered); 
  router.push('/quiz');
  setIsLoading(false);
};

  // AccordionView
const AccordionItem: FC<AccordionItemProps> = ({ title, children, isChecked, onCheckboxChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b">
      <div className="flex items-center justify-between">
        <label className="w-full flex justify- center text-left">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onCheckboxChange}
            className=" mr-4 h-4 w-4 flex-shrink-0 item-center text-blue-600 border-border-color rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling
          />
          <span className="font-semibold">{title}</span>
        </label>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 py-4 items-center focus:outline-none"
        >
          <span>{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>
      {isOpen && <div className="pb-4 pl-8">{children}</div>}
    </li>
  );
};

  // mainView
  return (
    <form
      onSubmit={handleStartQuiz}
      className="max-w-md sm:max-w-lg md:max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow"
    >
      <h1 className="text-2xl font-bold text-center mb-6">
        問題選択
      </h1>

      {!isLoading && (
        <div className="mb-4">
          <label className="block mb-1">対象問題</label>
          <select
            className="w-full border rounded p-2"
            value={activeQuizName}
            onChange={handleQuizNameChange}
          >
            {quizNames.map((s) => (
              <option key={s.id} value={String(s.quiz_name)}>
                {s.quiz_name_jp}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="text-center mb-4 text-red-500">{error}</div>
      )}

      {!isLoading && (
        <>
          <label className="block mb-1">問題選択</label>
          <div className="flex justify-end gap-4 mb-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-[#fa173d] hover:underline"
            >
              全て選択
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-[#fa173d] hover:underline"
            >
              全て解除
            </button>
          </div>

          <ul className="divide-y border rounded pb-20">
            {questions.map((q) => (
              <AccordionItem
                key={q.id}
                title={q.question}
                isChecked={selectedIds.includes(q.id)}
                onCheckboxChange={() => handleCheckboxChange(q.id)}
              >
                <div className="bg-primary-bg p-4 rounded-lg">
                  <p>正解: {q.choices[q.answerIndex]}</p>
                  <p className="text-sm mt-2">
                    解説: {q.explanation}
                  </p>
                </div>
              </AccordionItem>
            ))}
          </ul>

          
        </>
      )}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4">
        <button
        type="submit"
        disabled={selectedIds.length === 0}
        className="w-full py-3 bg-[#fa173d] text-white rounded-lg disabled:opacity-50"
        >
          スタート（全{selectedIds.length}問）
        </button>
      </div>
      {isLoading && <LoadingOverlay />}
    </form>
  );
}
