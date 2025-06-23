export const getSelectQuizList = (
  targetSheetName: string,
  categoryList: string[],
  output: GoogleAppsScript.Content.TextOutput
) => {
  try {
    const SPREADSHEET_ID =
      PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") ||
      process.env.SPREAD_SHEET_NAME ||
      "";
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) throw new Error("Sheet not found");

    const [header, ...rows] = sheet.getDataRange().getValues();
    const data: Question[] = rows
      .filter((row) => categoryList.includes(String(row[1])))
      .map((row) => {
        return {
          id: Number(row[0]),
          category: String(row[1]),
          question: String(row[2]),
          choices: [
            String(row[3]),
            String(row[4]),
            String(row[5]),
            String(row[6]),
          ],
          answerIndex: Number(row[7]) - 1,
          explanation: String(row[8]),
        };
      });

    const responseData: QuestionsResponse = {
      count: data.length,
      questions: data,
    };

    output.setContent(
      JSON.stringify({
        status: "ok",
        responseData,
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
