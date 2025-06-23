/**
 * 質問データの型定義をまとめた共有ファイル（型エイリアス版）
 */

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
 * API リクエスト全体を表す型
 */
declare type QuestionsRequest = {
  key: string;
  targetSheet?:string;
};

/**
 * API レスポンス全体を表す型
 */
declare type QuestionsResponse = {
  /**
   * 総問題数
   */
  count: number;
  /**
   * 質問データの配列
   */
  questions: Question[];
};
