import type { JSX, ReactNode } from "react";

import { QuizProvider } from "../context/QuizContext";
import AuthSessionProvider from "./AuthSessionProvider";
import Header from "@/components/Header";

import "./globals.css";

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
    <html lang="ja">
      <body className="min-h-screen bg-primary-bg">
        <AuthSessionProvider>
          <Header />
          <main className="container mx-auto p-4">
            <QuizProvider>{children}</QuizProvider>
          </main>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
