'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Hash, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  extractHeadings, 
  buildTOCTree, 
  findActiveHeading,
  filterTOCItems,
  type TOCItem as TOCItemType
} from '@/lib/toc-utils';

interface TOCProps {
  content: string;
  onHeadingClick?: (lineNumber: number) => void;
  className?: string;
  maxLevel?: number;
  minLevel?: number;
  enableScrollSpy?: boolean;
  scrollContainer?: HTMLElement | null;
}

export function TableOfContents({ 
  content, 
  onHeadingClick, 
  className,
  maxLevel = 6,
  minLevel = 1,
  enableScrollSpy = true,
  scrollContainer
}: TOCProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Extract and build TOC tree
  const { tocItems, tocTree } = useMemo(() => {
    const items = extractHeadings(content, { maxLevel, minLevel });
    const tree = buildTOCTree(items);
    return { tocItems: items, tocTree: tree };
  }, [content, maxLevel, minLevel]);

  // Filter items based on search
  const filteredTree = useMemo(() => {
    return filterTOCItems(tocTree, searchQuery);
  }, [tocTree, searchQuery]);

  // Auto-expand all sections by default
  useEffect(() => {
    const allSections = new Set(tocItems.map(item => item.id));
    setExpandedSections(allSections);
  }, [tocItems]);

  // Scroll spy functionality
  useEffect(() => {
    if (!enableScrollSpy) return;

    const handleScroll = () => {
      const container = scrollContainer || window;
      const scrollTop = container === window 
        ? window.scrollY 
        : (container as HTMLElement).scrollTop;

      const getHeadingElement = (id: string) => {
        // In preview pane, headings have IDs
        const element = document.getElementById(id);
        if (element) return element;
        
        // In editor, find by text content
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of headings) {
          const headingId = heading.textContent
            ?.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          if (headingId === id) {
            return heading as HTMLElement;
          }
        }
        return null;
      };

      const activeId = findActiveHeading(tocItems, scrollTop, getHeadingElement);
      if (activeId) {
        setActiveHeading(activeId);
      }
    };

    const scrollElement = scrollContainer || window;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [tocItems, enableScrollSpy, scrollContainer]);

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const handleHeadingClick = (item: TOCItemType) => {
    setActiveHeading(item.id);
    if (onHeadingClick && item.lineNumber) {
      onHeadingClick(item.lineNumber);
    }
  };

  const renderTOCItem = (item: TOCItemType, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isActive = activeHeading === item.id;
    const marginLeft = depth * 12;

    return (
      <div key={item.id} className="group">
        <div
          className={cn(
            "flex items-center gap-1 py-1.5 px-2 text-sm cursor-pointer rounded-md transition-all duration-200",
            isActive 
              ? "bg-primary/10 text-primary font-medium shadow-sm" 
              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          )}
          style={{ marginLeft: `${marginLeft}px` }}
          onClick={() => handleHeadingClick(item)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(item.id);
              }}
              className="p-0.5 hover:bg-muted rounded transition-colors"
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
              <Hash className="h-3 w-3 opacity-40" />
            </div>
          )}
          
          <span className="truncate flex-1" title={item.text}>
            {item.text}
          </span>
          
          {isActive && (
            <div className="w-1 h-4 bg-primary rounded-full ml-auto" />
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {item.children!.map(child => renderTOCItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (tocItems.length === 0) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No headings found</p>
        <p className="text-xs mt-1">Add some # headings to see the table of contents</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Table of Contents
          </h3>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Search headings"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headings..."
              className="w-full px-3 py-1.5 text-sm border rounded-md bg-background"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-3">
        <div className="space-y-0.5">
          {filteredTree.map(item => renderTOCItem(item))}
        </div>
        
        {filteredTree.length === 0 && searchQuery && (
          <div className="text-center text-muted-foreground text-sm mt-4">
            No headings match &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}