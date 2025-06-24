export const getSheetNameList = (
  sheetName: string,
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
    const data: SheetNameList[] = rows.map((row) => ({
      id: Number(row[0]),
      sheetName: String(row[1]),
      text: String(row[2]),
    }));

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
