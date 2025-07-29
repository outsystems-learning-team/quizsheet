'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from './Sidebar'; // Sidebar コンポーネントをインポート
import { IoLogOut } from "react-icons/io5";

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
        <div className="flex items-center gap-2">
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
          <Link href="/" className="text-xl sm:text-2xl font-bold">
            QuizSheet
          </Link>
        </div>
        <div>
          {session ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <span>{session.user?.name}</span>
              <button
                onClick={() => signOut()} 
                className="p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="サインアウト"
              >
                <IoLogOut className="h-8 w-8 text-red-500" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn('github')} 
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm sm:text-base"
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

