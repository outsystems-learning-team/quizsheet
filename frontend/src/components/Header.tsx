'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from './Sidebar'; // Sidebar コンポーネントをインポート

export default function Header() {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // サイドバーの開閉状態

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="bg-primary-bg shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* ハンバーガーボタンとタイトルをグループ化 */}
        <div className="flex items-center">
          {session && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {/* ハンバーガーアイコン */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <Link href="/" className="text-2xl font-bold">
            QuizSheet
          </Link>
        </div>
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="">{session.user?.name}</span>
              <button
                onClick={() => signOut()} 
                className="px-4 py-2 bg-red-500 text-primary-text rounded-md hover:bg-red-600 transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn('github')} 
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
            >
              GitHubでログイン
            </button>
          )}
        </div>
      </nav>
      {/* Sidebar コンポーネントをレンダリング */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </header>
  );
}
