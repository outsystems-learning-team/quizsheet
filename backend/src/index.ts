import { SPREAD_SHEET_NAME_LIST } from "@shared/constants";
/**
 * GET リクエストでスプレッドシート「Outsystems過去問」の問題データを返却
 */
export function doGet(
  e: GoogleAppsScript.Events.DoGet
): GoogleAppsScript.Content.TextOutput {
  try {
    // スクリプト・プロパティまたは直書きでスプレッドシートIDを指定
    const SPREADSHEET_ID =
      PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") ||
      "1cC8p5VXc6ofxdT1DkplyNoRMgevpj_RN9cNpU4iL0sM";

    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("associate_reactive_developer");
    if (!sheet) throw new Error("シート「outsystems_sheet」が見つかりません");

    // データ範囲を取得
    const rows = sheet.getDataRange().getValues();

    // ヘッダー行を除いてデータを型付きで整形
    const questions: Question[] = rows.slice(1).map((row) => ({
      id: Number(row[0]),
      category: String(row[1]),
      question: String(row[2]),
      choices: [String(row[3]), String(row[4]), String(row[5]), String(row[6])],
      answerIndex: Number(row[7]) - 1,
      explanation: String(row[8]),
    }));

    // レスポンス用オブジェクトを生成
    const response: QuestionsResponse = {
      count: questions.length,
      questions,
    };

    // JSON レスポンスを返却
    return ContentService.createTextOutput(
      JSON.stringify(response)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error: any) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// src/index.ts

export function doPost(e: GoogleAppsScript.Events.DoPost) {
  const output = ContentService.createTextOutput().setMimeType(
    ContentService.MimeType.JSON
  );

  let body: QuestionsRequest;
  try {
    body = JSON.parse(e.postData.contents);
  } catch {
    output.setContent(
      JSON.stringify({
        status: "error",
        message: "Invalid JSON",
      })
    );
    return output;
  }

  // key が sheet_name_list のときだけ処理
  if (body.key !== SPREAD_SHEET_NAME_LIST) {
    output.setContent(
      JSON.stringify({
        status: "error",
        message: "Invalid key",
      })
    );
    return output;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SPREAD_SHEET_NAME_LIST);
    if (!sheet) throw new Error("Sheet not found");

    const [header, ...rows] = sheet.getDataRange().getValues();
    const data = rows.map((row) => ({
      id: row[0],
      key: row[1],
      name: row[2],
    }));

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
}

void [doGet, doPost];
Object.assign(globalThis as any, { doGet, doPost });

