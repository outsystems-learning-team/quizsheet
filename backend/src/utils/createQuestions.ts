import { Question } from "@shared/types";

/**
 * スプレッドシートの行データから `Question` オブジェクトの配列を生成します。
 *
 * @param rows スプレッドシートから取得した行データの2次元配列。
 * @param categoryFilter オプション。カテゴリ名で絞り込む場合に指定します。
 * @returns 生成された `Question` オブジェクトの配列。
 */
export const createQuestions = (
  rows: unknown[][],
  categoryFilter?: readonly string[]
): Question[] => {
  // カテゴリで絞り込む（指定がなければ全行）
  const bodyRows = categoryFilter?.length
    ? rows.filter((row) => categoryFilter.includes(String(row[1])))
    : rows;

  // Question 型へマッピング
  return bodyRows.map(
    (row): Question => ({
      id: Number(row[0]),
      category: String(row[1]),
      question: String(row[2]),
      choices: [String(row[3]), String(row[4]), String(row[5]), String(row[6])],
      answerIndex: Number(row[7]) - 1,
      explanation: String(row[8]),
    })
  );
};
