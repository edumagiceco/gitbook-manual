'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  text: string;
  level: number;
  lineNumber?: number;
}

interface TOCProps {
  content: string;
  onHeadingClick?: (lineNumber: number) => void;
  className?: string;
}

export function TableOfContents({ content, onHeadingClick, className }: TOCProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeHeading, setActiveHeading] = useState<string>('');

  // Extract headings from markdown content
  const tocItems = useMemo(() => {
    const lines = content.split('\n');
    const items: TOCItem[] = [];
    
    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        
        items.push({
          id,
          text,
          level,
          lineNumber: index + 1,
        });
      }
    });
    
    return items;
  }, [content]);

  // Auto-expand all sections by default
  useEffect(() => {
    const allSections = new Set(tocItems.map(item => item.id));
    setExpandedSections(allSections);
  }, [tocItems]);

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const handleHeadingClick = (item: TOCItem) => {
    setActiveHeading(item.id);
    if (onHeadingClick && item.lineNumber) {
      onHeadingClick(item.lineNumber);
    }
  };

  const renderTOCItem = (item: TOCItem, index: number) => {
    const nextItem = tocItems[index + 1];
    const hasChildren = nextItem && nextItem.level > item.level;
    const isExpanded = expandedSections.has(item.id);
    const isActive = activeHeading === item.id;

    return (
      <div key={item.id} className="group">
        <div
          className={cn(
            "flex items-center gap-1 py-1 px-2 text-sm cursor-pointer rounded transition-colors",
            `ml-${(item.level - 1) * 2}`,
            isActive 
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          )}
          onClick={() => handleHeadingClick(item)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(item.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          
          {!hasChildren && (
            <div className="w-4 flex justify-center">
              <Hash className="h-3 w-3 opacity-50" />
            </div>
          )}
          
          <span className="truncate flex-1" title={item.text}>
            {item.text}
          </span>
          
          <span className="text-xs opacity-50 ml-2">
            H{item.level}
          </span>
        </div>
      </div>
    );
  };

  if (tocItems.length === 0) {
    return (
      <div className={cn("p-4 text-center text-gray-500 dark:text-gray-400", className)}>
        <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No headings found</p>
        <p className="text-xs mt-1">Add some # headings to see the table of contents</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-auto", className)}>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Table of Contents
        </h3>
        
        <div className="space-y-0.5">
          {tocItems.map((item, index) => renderTOCItem(item, index))}
        </div>
      </div>
    </div>
  );
}