import { Question, QuestionsResponse } from "../../shared/types";
import { createQuestions } from "./utils/createQuestions";
import { error, ok } from "./utils/output";
import { getAllRowsIncludingHeader } from "./utils/sheet";

/**
 * 指定シートからカテゴリー条件で絞り込んだクイズ一覧を返す。
 *
 * @param targetSheet
 * @param categoryList
 * @returns
 */
export const getSelectQuizList = (
  targetSheet: string,
  categoryList: string[]
): GoogleAppsScript.Content.TextOutput => {
  try {
    // ── 行データをカテゴリでフィルタ ＋ Question 型へ変換 ──────────
    const rows = getAllRowsIncludingHeader(targetSheet);

    const questions: Question[] = createQuestions(rows, categoryList);

    const response: QuestionsResponse = {
      count: questions.length,
      questions,
    };

    // ── 正常レスポンス ────────────────────────────────
    return ok(response);
  } catch (err: unknown) {
    // 例外を安全にメッセージへ変換
    return error(err instanceof Error ? err.message : "Unknown error");
  }
};
