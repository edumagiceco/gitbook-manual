'use client';

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-950/95",
      className
    )}>
      <div className="container flex h-14 items-center">
        {/* 모바일 메뉴 버튼 */}
        <button
          onClick={onMenuClick}
          className="mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* 로고 */}
        <Link 
          href="/" 
          className="mr-6 flex items-center space-x-2"
        >
          <div className="h-6 w-6 rounded bg-blue-600"></div>
          <span className="hidden font-bold sm:inline-block">
            GitBook Manual
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/docs" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-gray-100">
            Docs
          </Link>
          <Link href="/guides" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-gray-100">
            Guides
          </Link>
          <Link href="/examples" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-gray-100">
            Examples
          </Link>
          <Link href="/editor" className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-gray-100">
            Editor
          </Link>
        </nav>

        {/* 검색 */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden md:inline-block">Search documentation...</span>
              <span className="md:hidden">Search...</span>
              <kbd className="ml-auto hidden rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 md:inline-block dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
