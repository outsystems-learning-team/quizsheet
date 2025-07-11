import type { JSX } from "react";

/**
 * ローディングオーバーレイコンポーネント
 * 非同期処理中に表示される、半透明のグレー背景とスピナーを提供します。
 * @returns {JSX.Element} ローディングオーバーレイの UI 要素
 */
export function LoadingOverlay(): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
    </div>
  );
}
