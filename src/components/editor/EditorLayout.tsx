'use client';

import { Header } from "../header";
import { cn } from "@/lib/utils";

interface EditorLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorLayout({ 
  children, 
  className 
}: EditorLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      
      {/* Editor는 남은 전체 공간을 사용 */}
      <main className={cn(
        "flex-1 overflow-hidden",
        className
      )}>
        {children}
      </main>
    </div>
  );
}
