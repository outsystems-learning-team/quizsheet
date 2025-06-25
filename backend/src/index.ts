/**
 * Web API エントリーポイント
 * - `doGet`  : 動作確認用（固定シートの全問返却）
 * - `doPost` : key に応じて 3 種類のデータ取得を行うルーター
 *
 * 共通: Apps Script 用に `globalThis` へ doGet/doPost を公開
 */

import {
  SPREAD_SHEET_CATEGORY_LIST,
  SPREAD_SHEET_NAME_LIST,
  SPREAD_SHEET_SELECT_QUIZ,
} from "@shared/constants";
import type { Question, QuestionsResponse, QuestionsRequest } from "@shared/types";

import { getSheetNameList } from "./getSheetNameList";
import { getCategoryNameList } from "./getCategoryNameList";
import { getSelectQuizList } from "./getSelectQuizList";
import { getAllRowsIncludingHeader } from "./utils/sheet";
import { error, ok } from "./utils/output";
import { parseBody } from "./utils/parse";
import { createQuestions } from "./utils/createQuestions";
/* ------------------------------------------------------------------ */
/* doGet : 動作確認用シンプルエンドポイント                            */
/* ------------------------------------------------------------------ */

/**
 * `GET https://…/exec`
 * 固定シート（associate_reactive_developer）の全問を返す
 */
export function doGet(): GoogleAppsScript.Content.TextOutput {
  try {
    const sheetName = "associate_reactive_developer";
    const rows = getAllRowsIncludingHeader(sheetName);
    const questions: Question[] = createQuestions(rows);

    const response: QuestionsResponse = {
      count: questions.length,
      questions,
    };

    return ok(response);
  } catch (err: unknown) {
    return error(err instanceof Error ? err.message : "Unknown error");
  }
}

/* ------------------------------------------------------------------ */
/* doPost : ルーター                                                   */
/* ------------------------------------------------------------------ */

/**
 * POST ボディ例
 * ```json
 * { "key":"sheet_name_list" }
 * { "key":"category_name_list", "targetSheet":"english" }
 * { "key":"select_quiz", "targetSheet":"english", "category":["A","B"] }
 * ```
 */
export function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  /* ---- JSON パース ------------------------------------------------ */
  const body = parseBody<QuestionsRequest>(e.postData.contents);
  if (!body) {
    return error("Invalid JSON");
  }

  /* ---- ルーティング ------------------------------------------------ */
  switch (body.key) {
    case SPREAD_SHEET_NAME_LIST:
      return getSheetNameList(body.key);

    case SPREAD_SHEET_CATEGORY_LIST:
      if (!body.targetSheet) return error("targetSheet is required");
      return getCategoryNameList(body.key, body.targetSheet);

    case SPREAD_SHEET_SELECT_QUIZ:
      if (!body.targetSheet) return error("targetSheet is required");
      if (!body.category?.length) return error("category is required");
      return getSelectQuizList(body.targetSheet, body.category);

    default:
      return error("Invalid key");
  }
}

/* ------------------------------------------------------------------ */
/* GAS グローバル公開                                                  */
/* ------------------------------------------------------------------ */
void [doGet, doPost];
Object.assign(globalThis as Record<string, unknown>, { doGet, doPost });
