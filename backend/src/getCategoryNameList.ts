import { CategoryNameList } from "../../shared/types";
import { error, ok } from "./utils/output";
import { getAllRowsIncludingHeader } from "./utils/sheet";

/**
 * 指定シートから「カテゴリ名リスト」を抽出して JSON で返却する。
 *
 * @param key
 * @param targetSheetName
 * @returns
 */
export const getCategoryNameList = (
  key: string,
  targetSheetName: string
): GoogleAppsScript.Content.TextOutput => {
  try {
    // ── 行データを取得し、対象シート名でフィルタして型変換 ───────────
    const rows = getAllRowsIncludingHeader(key);
    const data: CategoryNameList[] = rows
      .filter((row) => row[1] === targetSheetName) // 列 B が一致する行のみ
      .map(
        (row) =>
          ({
            id: Number(row[0]),
            sheetName: String(row[1]),
            categoryName: String(row[2]),
          }) satisfies CategoryNameList
      );

    // ── 正常レスポンス ───────────────────────────────────
    return ok(data);
  } catch (err: unknown) {
    // 例外を安全にメッセージへ変換
    return error(err instanceof Error ? err.message : "Unknown error");
  }
};
