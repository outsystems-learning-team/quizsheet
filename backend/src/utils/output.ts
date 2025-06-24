/**
 * 共通レスポンスユーティリティ
 * ─────────────────────────────────────────────────────────
 * - `json()` : ContentService.TextOutput を生成する一段ラッパー
 * - `ok()`   : 成功レスポンス { status:"ok", data }
 * - `error()`:_失敗レスポンス { status:"error", message }
 */

/**
 * JSON レスポンスを出力する共通ヘルパー
 * @param body 返却するオブジェクト（status フィールド必須）
 * @returns    TextOutput (application/json)
 */
const json = <T extends { status: "ok" | "error" }>(body: T): GoogleAppsScript.Content.TextOutput =>
  ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);

/**
 * 成功レスポンス
 *
 * @example
 * return ok({ users });
 */
export const ok = <T>(data: T): GoogleAppsScript.Content.TextOutput => json({ status: "ok", data });

/**
 * エラーレスポンス
 *
 * @example
 * return error('Invalid parameters');
 */
export const error = (message: string): GoogleAppsScript.Content.TextOutput =>
  json({ status: "error", message });
