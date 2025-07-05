import { Question, QuestionsResponse } from "../../shared/types";
import { createQuestions } from "./utils/createQuestions";
import { error, ok } from "./utils/output";
import { getAllRowsIncludingHeader } from "./utils/sheet";

/**
 * 指定されたシートから、カテゴリ条件で絞り込んだクイズのリストを返します。
 *
 * @param targetSheet クイズを取得するシート名。
 * @param categoryList 絞り込み条件となるカテゴリ名の配列。
 * @returns 絞り込まれたクイズのリストを含むJSONレスポンス。
 */
export const getSelectQuizList = (
  targetSheet: string,
  categoryList: string[]
): GoogleAppsScript.Content.TextOutput => {
  try {
    // --- 行データをカテゴリでフィルタ ＋ Question 型へ変換 ---
    const rows = getAllRowsIncludingHeader(targetSheet);

    const questions: Question[] = createQuestions(rows, categoryList);

    const response: QuestionsResponse = {
      count: questions.length,
      questions,
    };

    // --- 正常レスポンス ---
    return ok(response);
  } catch (err: unknown) {
    // 例外を安全にメッセージへ変換
    return error(err instanceof Error ? err.message : "Unknown error");
  }
};
