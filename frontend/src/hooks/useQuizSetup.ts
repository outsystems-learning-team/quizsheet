import { useState, useEffect, useContext } from "react";
import { QuizContext } from "../context/QuizContext";
import { fetchQuizApi } from "../lib/api";
import {Question, CategoryNameList, SheetNameList} from "@quizsheet/shared/types"
import { SPREAD_SHEET_CATEGORY_LIST, SPREAD_SHEET_NAME_LIST, SPREAD_SHEET_SELECT_QUIZ } from "@quizsheet/shared/constants";

/**
 * クイズのセットアップと状態管理を行うカスタムフック。
 * クイズのカテゴリ、シート、問題数を管理し、APIから問題を取得する。
 */
export const useQuizSetup = () => {
  const { quizState, setQuizState } = useContext(QuizContext);
  const [categoryNameList, setCategoryNameList] = useState<CategoryNameList[]>([]);
  const [sheetNameList, setSheetNameList] = useState<SheetNameList[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カテゴリ名リストの取得
  useEffect(() => {
    const getCategoryNames = async () => {
      try {
        const data = await fetchQuizApi<{ categoryNameList: CategoryNameList[] }>({ key: SPREAD_SHEET_CATEGORY_LIST });
        setCategoryNameList(data.categoryNameList);
      } catch (err) {
        setError("カテゴリ名の取得に失敗しました。");
        console.error(err);
      }
    };
    getCategoryNames();
  }, []);

  // シート名リストの取得
  useEffect(() => {
    if (quizState.selectedCategory) {
      const getSheetNames = async () => {
        try {
          const data = await fetchQuizApi<{ sheetNameList: SheetNameList[] }>({ key: SPREAD_SHEET_NAME_LIST, category: [quizState.selectedCategory] });
          setSheetNameList(data.sheetNameList);
        } catch (err) {
          setError("シート名の取得に失敗しました。");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      getSheetNames();
    }
  }, [quizState.selectedCategory]);

  // 問題の取得
  const fetchQuestionsHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuizApi<{ questions: Question[] }>({ key: SPREAD_SHEET_SELECT_QUIZ, category: [quizState.selectedCategory], targetSheet: quizState.selectedSheet });
      setQuestions(data.questions);
    } catch (err) {
      setError("問題の取得に失敗しました。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categoryNameList,
    sheetNameList,
    questions,
    loading,
    error,
    fetchQuestionsHandler,
    quizState,
    setQuizState,
  };
};