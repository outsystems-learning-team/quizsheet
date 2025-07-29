"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* サイドバー本体 */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-primary-bg shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 p-4`} // サイドバーの幅とパディング
      >
        <h2 className="text-2xl font-bold mb-6">メニュー</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <Link
                href="/"
                className="text-lg hover:text-blue-600"
                onClick={onClose}
              >
                出題設定
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/add-quiz" className="text-lg hover:text-blue-600" onClick={onClose}>
                問題管理
              </Link>
            </li>
            <li className="mb-4">
              <Link
                href="/progress"
                className="text-lg hover:text-blue-600"
                onClick={onClose}
              >
                学習進捗
              </Link>
            </li>
            {/* 今後、ログインユーザー向けの機能を追加 */}
          </ul>
        </nav>
      </div>
    </>
  );
}
