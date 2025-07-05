import { SheetNameList } from "../../shared/types";
import { getAllRowsIncludingHeader } from "./utils/sheet";
import { ok, error } from "./utils/output";

/**
 * 指定されたキー（シート名）に対応するシートの全行を `SheetNameList` 型に変換し、JSON形式で返します。
 *
 * @param key シート名。
 * @returns `SheetNameList` の配列を含むJSONレスポンス。
 */
export const getSheetNameList = (key: string) => {
  try {
    // --- 行データを型変換 ---
    const rows = getAllRowsIncludingHeader(key);
    const data: SheetNameList[] = rows.map(
      (row): SheetNameList => ({
        id: Number(row[0]),
        sheetName: String(row[1]),
        text: String(row[2]),
      })
    );
    // --- 正常レスポンス ---
    return ok(data);
  } catch (err: unknown) {
    // 例外を安全にメッセージへ変換
    return error(err instanceof Error ? err.message : "Unknown error");
  }
};
