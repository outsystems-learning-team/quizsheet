import { Question } from "@shared/types";

/**
 * 2 次元配列から Question オブジェクトの配列を生成するユーティリティ
 *
 * @param rows          スプレッドシートから取得した行データ（ヘッダーを除く）
 * @param categoryFilter ここで指定したカテゴリ名のみ抽出（省略可）
 * @returns             Question 型の配列
 */
export const createQuestions = (
  rows: unknown[][],
  categoryFilter?: readonly string[]
): Question[] => {
  //カテゴリで絞り込む（指定がなければ全行）
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
