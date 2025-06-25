/* utils/sheet.ts
 * スプレッドシート／シート取得ヘルパー
 * --------------------------------------------------------------- */

let cachedSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null;

/**
 * プロジェクト既定の **Spreadsheet** を返す。<br>
 * - 先にメモ化している場合はキャッシュを返却
 * - ID が取得できない場合は例外を送出
 *
 * @param explicitId  明示的に ID を渡したい場合だけ指定
 */
export const getSpreadsheet = (explicitId?: string): GoogleAppsScript.Spreadsheet.Spreadsheet => {
  if (cachedSpreadsheet && !explicitId) {
    return cachedSpreadsheet;
  }

  const id =
    explicitId ??
    PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") ??
    process.env.SPREAD_SHEET_NAME;

  if (!id) throw new Error("SPREADSHEET_ID is not defined");

  cachedSpreadsheet = SpreadsheetApp.openById(id);
  return cachedSpreadsheet;
};

/**
 * 指定シートを取得し、存在しなければ `Error` を投げるユーティリティ
 *
 * @param name  シート名
 * @param ss    対象スプレッドシート（省略時は {@link getSpreadsheet}）
 * @return      取得した `Sheet`
 * @throws      `Error` シートが存在しない場合
 */
export const getSheetOrThrow = (
  name: string,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet = getSpreadsheet()
): GoogleAppsScript.Spreadsheet.Sheet => {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`Sheet not found: ${name}`);
  return sheet;
};

/**
 * 指定シートの全セル（ヘッダー行含む）を取得するユーティリティ
 * @param name 取得対象のシート名
 * @param ss   対象の Spreadsheet（省略時は getSpreadsheet()）
 * @returns 2次元配列 [row][col]
 */
export const getAllRowsIncludingHeader = (
  name: string,
  ss: GoogleAppsScript.Spreadsheet.Spreadsheet = getSpreadsheet()
): unknown[][] => {
  const sheet = getSheetOrThrow(name, ss);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return []; // データ行が無い
  // 2 行目から取得
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
};
