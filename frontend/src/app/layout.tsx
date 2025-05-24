import { QuizProvider } from "./context/QuizContext";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "QuizSheet",
  description: "Web 四択問題アプリ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4">
          <QuizProvider>{children}</QuizProvider>
        </div>
      </body>
    </html>
  );
}
