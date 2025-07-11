'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-primary-bg shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          QuizSheet
        </Link>
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
              className="px-4 py-2 bg-gray-800 text-primary-text rounded-md hover:bg-gray-900 transition-colors"
            >
              GitHubでログイン
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
