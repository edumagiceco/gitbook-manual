'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarNavItem } from "@/types";
import { useState } from "react";

interface SidebarProps {
  items: SidebarNavItem[];
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ items, className, isOpen = true, onClose }: SidebarProps) {
  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:sticky md:translate-x-0 dark:border-gray-800 dark:bg-gray-950",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="p-4">
          <nav className="space-y-2">
            {items.map((item, index) => (
              <SidebarNavItem key={index} item={item} />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

interface SidebarNavItemProps {
  item: SidebarNavItem;
  level?: number;
}

function SidebarNavItem({ item, level = 0 }: SidebarNavItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(
    item.items?.some(child => pathname === child.href) || false
  );
  const isActive = pathname === item.href;
  const hasChildren = item.items && item.items.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          level > 0 && "ml-4",
          isActive
            ? "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
          item.disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full items-center justify-between"
          >
            <span>{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "flex w-full items-center",
              item.disabled && "pointer-events-none"
            )}
          >
            {item.title}
          </Link>
        )}
      </div>

      {/* 하위 메뉴 */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.items?.map((child, index) => (
            <SidebarNavItem 
              key={index} 
              item={child} 
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
