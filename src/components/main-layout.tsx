'use client';

import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { TableOfContents } from "./table-of-contents";
import { cn } from "@/lib/utils";
import { SidebarNavItem, TocItem } from "@/types";

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarItems?: SidebarNavItem[];
  tocItems?: TocItem[];
  className?: string;
}

export function MainLayout({ 
  children, 
  sidebarItems = [], 
  tocItems = [],
  className 
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header onMenuClick={toggleSidebar} />
      
      <div className="flex">
        {/* 사이드바 */}
        <Sidebar 
          items={sidebarItems}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* 메인 콘텐츠 영역 */}
        <main className={cn(
          "flex-1 md:ml-64",
          className
        )}>
          <div className="flex">
            {/* 콘텐츠 */}
            <div className="flex-1 min-w-0">
              <div className="px-4 py-6 lg:px-8">
                {children}
              </div>
            </div>

            {/* 우측 목차 패널 */}
            {tocItems.length > 0 && (
              <aside className="hidden w-64 shrink-0 xl:block">
                <div className="sticky top-20 px-4 py-6">
                  <TableOfContents items={tocItems} />
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
