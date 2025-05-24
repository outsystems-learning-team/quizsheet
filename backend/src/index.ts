/**
 * GET リクエストでスプレッドシート「Outsystems過去問」の問題データを返却
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  try {
    // スプレッドシートIDを指定
    const SPREADSHEET_ID = '1cC8p5VXc6ofxdT1DkplyNoRMgevpj_RN9cNpU4iL0sM';
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('outsystems_sheet');
    if (!sheet) throw new Error('シート「outsystems_sheet」が見つかりません');

    // データ範囲を取得
    const rows = sheet.getDataRange().getValues();

    // ヘッダー行を除いてデータを整形
    const questions = rows.slice(1).map(row => ({
      id: row[0] as number,
      category: row[1] as string,
      question: row[2] as string,
      choices: [
        row[3] as string,
        row[4] as string,
        row[5] as string,
        row[6] as string
      ],
      answerIndex: row[7] as number,
      explanation: row[8] as string
    }));

    // JSON レスポンスを返却
    return ContentService
      .createTextOutput(JSON.stringify({ count: questions.length, questions }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error: any) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
