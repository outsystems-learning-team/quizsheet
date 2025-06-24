import { SheetNameList } from "../../shared/types";
import { getAllRowsIncludingHeader } from "./utils/sheet";
import { ok, error } from "./utils/output";

/**
 * 指定シートの全行を `SheetNameList` 型に変換して JSON で返す。
 *
 * @param key
 * @returns
 */
export const getSheetNameList = (key: string) => {
  try {
    // ── 行データを型変換 ───────────────────────────────────
    const rows = getAllRowsIncludingHeader(key);
    const data: SheetNameList[] = rows.map(
      (row): SheetNameList => ({
        id: Number(row[0]),
        sheetName: String(row[1]),
        text: String(row[2]),
      })
    );
    // ── 正常レスポンス ───────────────────────────────────
    return ok(data);
  } catch (err: unknown) {
    // 例外を安全にメッセージへ変換
    return error(err instanceof Error ? err.message : "Unknown error");
  }
};
