import type { JSX, ReactNode } from "react";

import { QuizProvider } from "../context/QuizContext";

import "./globals.css";

/**
 * ページ全体のメタ情報を設定するオブジェクト
 *
 * title: ブラウザのタイトルバーやタブに表示される文字列
 * description: ページの説明（SEO や SNS シェア時に使用）
 */
export const metadata = {
  title: "QuizSheet",
  description: "Web 四択問題アプリ",
};

/**
 * ルートレイアウトコンポーネント
 *
 * 全ページ共通の HTML 構造とスタイル、グローバル CSS を適用し、
 * QuizContext を提供するプロバイダーで子コンポーネントをラップします。
 *
 * @param {{ children: ReactNode }} props - レイアウト内に描画する子要素
 * @param {ReactNode} props.children - 各ページのコンテンツ
 * @returns {JSX.Element} ルートレイアウトの JSX
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    // ドキュメントのルート要素
    <html lang="ja">
      {/* ページ全体の背景色と最小高さを設定 */}
      <body className="min-h-screen bg-gray-50">
        {/* コンテンツを中央寄せにし、余白を付与するコンテナ */}
        <div className="container mx-auto p-4">
          {/* QuizProvider でコンテキストを提供し、子要素をラップ */}
          <QuizProvider>{children}</QuizProvider>
        </div>
      </body>
    </html>
  );
}
