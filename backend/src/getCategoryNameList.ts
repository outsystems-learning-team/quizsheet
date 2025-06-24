import { CategoryNameList } from "../../shared/types";

export const getCategoryNameLits = (
  sheetName: string,
  targetSheetName: string,
  output: GoogleAppsScript.Content.TextOutput
) => {
  try {
    const SPREADSHEET_ID =
      PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") ||
      process.env.SPREAD_SHEET_NAME ||
      "";
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found");

    const [...rows] = sheet.getDataRange().getValues();
    const data: CategoryNameList[] = rows
      .filter((row) => row[1] === targetSheetName)
      .map((row) => {
        return {
          id: row[0],
          sheetName: row[1],
          categoryName: row[2],
        };
      });

    output.setContent(
      JSON.stringify({
        status: "ok",
        data,
      })
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    output.setContent(JSON.stringify({ status: "error", message }));
  }

  return output;
};
