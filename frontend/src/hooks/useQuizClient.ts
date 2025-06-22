"use client";

import { useState, useEffect, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { QuizContext } from "../context/QuizContext";

/**
 * URL クエリ → フィルタ／シャッフル／切り詰めを行い、
 * 表示用の問題リストを返すカスタムフック
 *
 * @returns {{
 *   questions: Question[];      // 表示用に用意された問題リスト
 *   reset: () => void;          // 再度フック処理を走らせたいときに呼ぶ
 * }}
 */
export function useQuizClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { questions: allQuestions } = useContext(QuizContext);

  // クエリから出題数を取得（未指定時は 0）
  const count = Number(params.get("count") ?? "0");
  // クエリからカテゴリ配列を取得
  const rawCategories = params.getAll("category");
  // catsKey: カテゴリ配列を join した文字列
  const catsKey = rawCategories.join(",");

  // このページで扱う問題リスト
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Context が空ならまだロード待ち
    if (allQuestions.length === 0) return;

    // バリデーション：不正パラメータならトップへリダイレクト
    if (count <= 0 || rawCategories.length === 0) {
      router.push("/");
      return;
    }

    // 1. フィルタリング：指定カテゴリのみ
    let filtered = allQuestions.filter((q) =>
      rawCategories.includes(q.category)
    );

    // 2. シャッフル（Fisher–Yates）
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }

    // 3. 切り詰め：出題数以上なら先頭 count 件のみ
    if (filtered.length > count) {
      filtered = filtered.slice(0, count);
    }

    setQuestions(filtered);
    // catsKey を唯一のカテゴリ依存キーとして扱う
    // rawCategories は catsKey で代替しているので依存配列から外す
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuestions, count, catsKey, router]);

  /**
   * フックの処理をもう一度走らせたい場合に呼ぶリセット関数
   * （必要に応じて実装例）
   */
  const reset = () => {
    setQuestions([]);
  };

  return { questions, reset };
}
