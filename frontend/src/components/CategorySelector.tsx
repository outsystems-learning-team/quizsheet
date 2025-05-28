"use client";

import type { FC } from "react";

type Props = {
  /** 利用可能なカテゴリ一覧 */
  availableCategories: string[];
  /** 現在選択中のカテゴリ一覧 */
  selectedCategories: string[];
  /** カテゴリ選択をトグルする関数 */
  toggleCategory: (cat: string) => void;
  /** データ読み込み中フラグ */
  loading: boolean;
  /** 全カテゴリを選択状態にする関数 */
  selectAll: () => void;
  /** 全カテゴリ選択を解除する関数 */
  clearAll: () => void;
};

/**
 * カテゴリ選択用のチェックボックスリストコンポーネント
 *
 * @param props.availableCategories 利用可能なカテゴリの配列
 * @param props.selectedCategories 現在選択されているカテゴリの配列
 * @param props.toggleCategory カテゴリ選択/解除を行うトグル関数
 * @param props.loading データ読み込み中かどうかのフラグ
 * @param props.selectAll 全カテゴリを選択する関数
 * @param props.clearAll 全カテゴリ選択を解除する関数
 * @returns チェックボックスによるカテゴリ選択UI
 */
export const CategorySelector: FC<Props> = ({
  availableCategories,
  selectedCategories,
  toggleCategory,
  loading,
  selectAll,
  clearAll,
}) => (
  // コンポーネント全体を囲むマージン設定
  <div className="mb-6">
    {/* ヘッダー領域：タイトルと全選択／全解除ボタン */}
    <div className="flex justify-between items-center mb-2">
      <p>カテゴリ選択</p>
      <div>
        {/* すべて選択ボタン */}
        <button
          type="button"
          className="text-sm sm:text-base mr-2 text-[#fa173d]"
          onClick={selectAll}
          disabled={loading}
        >
          全て選択
        </button>
        {/* すべて解除ボタン */}
        <button
          type="button"
          className="text-sm sm:text-base text-[#fa173d]"
          onClick={clearAll}
          disabled={loading}
        >
          全て解除
        </button>
      </div>
    </div>

    {/* カテゴリチェックボックス一覧をグリッド表示 */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {availableCategories.map((cat) => (
        <label key={cat} className="flex items-start space-x-2">
          {/* カテゴリ選択用チェックボックス */}
          <input
            type="checkbox"
            checked={selectedCategories.includes(cat)}
            onChange={() => toggleCategory(cat)}
            disabled={loading}
            className="mt-1 w-4 h-4"
          />
          {/* カテゴリ名表示 */}
          <span className="whitespace-normal break-words">{cat}</span>
        </label>
      ))}
    </div>
  </div>
);
