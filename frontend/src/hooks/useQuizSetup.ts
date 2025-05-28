"use client";

import { useState, useEffect, useContext } from "react";
import { QuizContext } from "../context/QuizContext";
import { fetchQuestions } from "../lib/api";

/**
 * クイズ開始前のデータ取得＆カテゴリ選択ロジックを提供するカスタムフック
 *
 * - 初回ロード時に API から問題一覧を取得し、Context に保存
 * - 取得した問題からユニークなカテゴリ一覧を生成
 * - カテゴリの選択／全選択／全解除のロジックを提供
 *
 * @returns {{
 *   loading: boolean;             // データ読み込み中かどうか
 *   error: string \| null;        // 発生したエラーメッセージ
 *   availableCategories: string[];// 利用可能なカテゴリ一覧
 *   selectedCategories: string[]; // 現在選択中のカテゴリ一覧
 *   toggleCategory: (cat: string) => void; // 指定カテゴリの選択状態をトグル
 *   selectAll: () => void;        // 全カテゴリを選択
 *   clearAll: () => void;         // 全カテゴリ選択をクリア
 * }}
 */
export function useQuizSetup() {
  // QuizContext から問題リストと setter を取得
  const { questions, setQuestions } = useContext(QuizContext);

  // ユニークなカテゴリ一覧（チェックボックス表示用）
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  // ユーザーが選択したカテゴリ一覧
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // データ取得中フラグ
  const [loading, setLoading] = useState<boolean>(true);
  // エラーメッセージ保持用
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);    // ローディング開始
      setError(null);      // 既存エラーをクリア
      try {
        // Context に問題が未セットの場合のみ API 呼び出し
        if (questions.length === 0) {
          const qs = await fetchQuestions();
          setQuestions(qs);
        }
        // 問題リストからカテゴリ一覧を生成し、選択状態もデフォルトで全選択
        const cats = getUniqueCategories(questions.length > 0 ? questions : []);
        setAvailableCategories(cats);
        setSelectedCategories(cats);
      } catch (e: unknown) {
        // Error オブジェクトならメッセージを、そうでなければ汎用エラー文をセット
        setError(e instanceof Error ? e.message : "不明なエラーが発生しました");
      } finally {
        setLoading(false); // ローディング終了
      }
    })();
  }, [questions, setQuestions]);

  /**
   * 指定したカテゴリの選択状態をトグル（有効⇔無効）
   * @param category - トグル対象のカテゴリ名
   */
  const toggleCategory = (category: string) =>
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category) // 選択解除
        : [...prev, category]                // 選択追加
    );

  /** 全てのカテゴリを選択状態にする */
  const selectAll = () => setSelectedCategories([...availableCategories]);

  /** 全カテゴリ選択を解除する */
  const clearAll = () => setSelectedCategories([]);

  // フック利用者へ各ステート＆操作関数を返却
  return {
    loading,
    error,
    availableCategories,
    selectedCategories,
    toggleCategory,
    selectAll,
    clearAll,
  };
}

/**
 * Question[] からユニークなカテゴリ一覧を生成するユーティリティ関数
 *
 * @param questions - Question オブジェクトの配列
 * @returns string[] - 重複を除いたカテゴリ名一覧
 */
const getUniqueCategories = (questions: Question[]): string[] =>
  Array.from(new Set(questions.map((q) => q.category)));
