import {
  SPREAD_SHEET_NAME_LIST,
  SPREAD_SHEET_CATEGORY_LIST,
  SPREAD_SHEET_SELECT_QUIZ,
} from "./constants";

/**
 * 1問分の情報を表す型
 */
declare type Question = {
  id: number; //問題の一意なID
  category: string; //質問のカテゴリー
  question: string; //問題文のテキスト
  choices: [string, string, string, string]; //選択肢4つの配列。順番は表示順に対応。
  answerIndex: number; //正解の選択肢のインデックス（0〜3）
  explanation: string; //問題の詳細な解説文
};

/**
 *  全問分の情報を表す型
 */
declare type QuestionsResponse = {
  count: number; //総問題数
  questions: Question[]; // 質問データの配列
};

/**
 * API リクエスト全体を表す型
 */
declare type QuestionsRequest = {
  key:
    | typeof SPREAD_SHEET_NAME_LIST
    | typeof SPREAD_SHEET_CATEGORY_LIST
    | typeof SPREAD_SHEET_SELECT_QUIZ;
  targetSheet?: string;
  category?: string[];
};

declare type SheetNameList = {
  id: number;
  sheetName: string;
  text: string;
};

declare type CategoryNameList = {
  id: number;
  sheetName: string;
  categoryName: string;
};
