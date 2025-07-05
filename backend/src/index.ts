/**
 * @file Web APIのエントリーポイントです。
 * `doGet`と`doPost`をGoogle Apps Scriptのグローバル関数として公開します。
 */

import {
  SPREAD_SHEET_CATEGORY_LIST,
  SPREAD_SHEET_NAME_LIST,
  SPREAD_SHEET_SELECT_QUIZ,
} from "@shared/constants";
import type { Question, QuestionsRequest, QuestionsResponse } from "@shared/types";

import { getCategoryNameList } from "./getCategoryNameList";
import { getInitData } from "./getInitData";
import { getSelectQuizList } from "./getSelectQuizList";
import { createQuestions } from "./utils/createQuestions";
import { error, ok } from "./utils/output";
import { parseBody } from "./utils/parse";
import { getAllRowsIncludingHeader } from "./utils/sheet";
// --- doGet : 動作確認用シンプルエンドポイント ---

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

// --- doPost : ルーター ---

/**
 * POST ボディ例
 * ```json
 * { "key":"sheet_name_list" }
 * { "key":"category_name_list", "targetSheet":"english" }
 * { "key":"select_quiz", "targetSheet":"english", "category":["A","B"] }
 * ```
 */
export function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  // --- JSON パース ---
  const body = parseBody<QuestionsRequest>(e.postData.contents);
  if (!body) {
    return error("Invalid JSON");
  }

  // --- ルーティング ---
  switch (body.key) {
    case SPREAD_SHEET_NAME_LIST: // ★追加
      return getInitData();

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

// --- GAS グローバル公開 ---
void [doGet, doPost];
Object.assign(globalThis as Record<string, unknown>, { doGet, doPost });
