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

    const [header, ...rows] = sheet.getDataRange().getValues();
    const data = rows.map((row) => {
      if (row[1] === targetSheetName)
        return {
          id: row[0],
          sheet_name: row[1],
          category: row[2],
        };
    });

    output.setContent(
      JSON.stringify({
        status: "ok",
        data,
      })
    );
  } catch (err: any) {
    output.setContent(
      JSON.stringify({
        status: "error",
        message: err.message || "Unknown error",
      })
    );
  }

  return output;
};
