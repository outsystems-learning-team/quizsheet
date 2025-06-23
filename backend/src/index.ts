import {
  SPREAD_SHEET_CATEGORY_LIST,
  SPREAD_SHEET_NAME_LIST,
} from "@shared/constants";
import { getSheetNameList } from "./getSheetNameList";
import { getCategoryNameLits } from "./getCategoryNameLits";
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
      process.env.SPREAD_SHEET_NAME ||
      "";

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

  switch (body.key) {
    case SPREAD_SHEET_NAME_LIST:
      getSheetNameList(body.key, output);
      return output;
    case SPREAD_SHEET_CATEGORY_LIST:
      if (body.targetSheet) {
        getCategoryNameLits(body.key, body.targetSheet, output);
        return output;
      } else {
        output.setContent(
          JSON.stringify({
            status: "error",
            message: "Invalid targetSheet",
          })
        );
      }

    default:
      output.setContent(
        JSON.stringify({
          status: "error",
          message: "Invalid key",
        })
      );
      return output;
  }
}

void [doGet, doPost];
Object.assign(globalThis as any, { doGet, doPost });
