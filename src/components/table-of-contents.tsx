'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TocItem } from "@/types";

interface TableOfContentsProps {
  items?: TocItem[];
  className?: string;
}

export function TableOfContents({ items = [], className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0% 0% -80% 0%' }
    );

    // 모든 헤딩 요소 관찰
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="font-medium text-gray-900 dark:text-gray-100">
        On this page
      </p>
      <nav className="space-y-1">
        {items.map((item, index) => (
          <TocLink 
            key={index} 
            item={item} 
            activeId={activeId}
          />
        ))}
      </nav>
    </div>
  );
}

interface TocLinkProps {
  item: TocItem;
  activeId: string;
  level?: number;
}

function TocLink({ item, activeId, level = 0 }: TocLinkProps) {
  const isActive = activeId === item.url.slice(1); // '#'를 제거

  return (
    <div>
      <a
        href={item.url}
        className={cn(
          "block border-l-2 py-1 pl-3 text-sm transition-colors",
          level > 0 && "ml-4",
          isActive
            ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
            : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
        )}
      >
        {item.title}
      </a>
      
      {item.items && item.items.length > 0 && (
        <div className="mt-1">
          {item.items.map((child, index) => (
            <TocLink 
              key={index} 
              item={child} 
              activeId={activeId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
