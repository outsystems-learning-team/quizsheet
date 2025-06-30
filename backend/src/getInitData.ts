import { SPREAD_SHEET_CATEGORY_LIST, SPREAD_SHEET_NAME_LIST } from "@shared/constants";
import { CategoryNameList, InitData, SheetNameList } from "@shared/types";
import { error, ok } from "./utils/output";
import { getAllRowsIncludingHeader } from "./utils/sheet";

// 定数は既存と同じものを再利用
const SHEET_NAME_LIST_KEY = SPREAD_SHEET_NAME_LIST as string;
const CATEGORY_LIST_KEY = SPREAD_SHEET_CATEGORY_LIST as string;

/**
 * 「シート一覧」と「カテゴリ一覧」をまとめて返す。
 * @param targetSheetName 先頭以外を初期表示にしたいときだけ指定
 */
export const getInitData = (
  targetSheetName?: string // ← 任意パラメータに変更
): GoogleAppsScript.Content.TextOutput => {
  try {
    /* ---------- ① シート名リスト ---------- */
    const sheetRows = getAllRowsIncludingHeader(SHEET_NAME_LIST_KEY);
    const sheetNameList: SheetNameList[] = sheetRows.map(
      (row) =>
        ({
          id: Number(row[0]),
          sheetName: String(row[1]),
          text: String(row[2]),
        }) satisfies SheetNameList
    );

    // 先頭シート or 指定シートをアクティブ扱いに
    const activeSheet = targetSheetName ?? sheetNameList[0]?.sheetName ?? "";

    /* ---------- ② カテゴリ名リスト ---------- */
    const catRows = getAllRowsIncludingHeader(CATEGORY_LIST_KEY);
    const categoryNameList: CategoryNameList[] = catRows
      .filter((row) => String(row[1]).trim() === activeSheet.trim())
      .map(
        (row) =>
          ({
            id: Number(row[0]),
            sheetName: String(row[1]).trim(),
            categoryName: String(row[2]).trim(),
          }) satisfies CategoryNameList
      );

    /* ---------- ③ まとめてレスポンス ---------- */
    const payload: InitData = {
      sheetNameList,
      categoryNameList,
    };
    return ok(payload);
  } catch (err: unknown) {
    return error(err instanceof Error ? err.message : "Unknown error");
  }
};
