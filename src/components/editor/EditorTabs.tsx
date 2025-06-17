'use client';

import { useState, useRef } from 'react';
import { X, Plus, FileText, Save, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditorTab {
  id: string;
  title: string;
  content: string;
  filePath?: string;
  isDirty: boolean;
  isActive: boolean;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onTabSave?: (tabId: string) => void;
  className?: string;
}

export function EditorTabs({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  onTabSave,
  className,
}: EditorTabsProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== tabId) {
      setDragOverTab(tabId);
    }
  };

  const handleTabDragLeave = () => {
    setDragOverTab(null);
  };

  const handleTabDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== targetTabId) {
      // Emit reorder event - would need to be implemented in parent
      console.log('Reorder tabs:', draggedTab, 'to', targetTabId);
    }
    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      onTabClose(tabId);
    }
  };

  const getTabDisplayTitle = (tab: EditorTab): string => {
    if (tab.filePath) {
      const fileName = tab.filePath.split('/').pop() || tab.title;
      return fileName.replace(/\.[^/.]+$/, ''); // Remove file extension
    }
    return tab.title;
  };

  return (
    <div className={cn("flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", className)}>
      {/* Tabs Container */}
      <div 
        ref={tabsRef}
        className="flex-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        style={{ scrollbarWidth: 'thin' }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => handleTabDragStart(e, tab.id)}
            onDragOver={(e) => handleTabDragOver(e, tab.id)}
            onDragLeave={handleTabDragLeave}
            onDrop={(e) => handleTabDrop(e, tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-0 max-w-48 relative",
              tab.id === activeTabId 
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
              dragOverTab === tab.id && "border-l-2 border-l-blue-500",
              draggedTab === tab.id && "opacity-50"
            )}
            onClick={() => onTabClick(tab.id)}
            title={tab.filePath || tab.title}
          >
            {/* File Icon */}
            <FileText className="h-4 w-4 flex-shrink-0" />
            
            {/* Tab Title */}
            <span className="truncate flex-1 min-w-0">
              {getTabDisplayTitle(tab)}
            </span>
            
            {/* Dirty/Save Status */}
            {tab.isDirty && (
              <div className="flex items-center gap-1">
                {onTabSave && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabSave(tab.id);
                    }}
                    className="p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Save"
                  >
                    <Save className="h-3 w-3" />
                  </button>
                )}
                <Circle className="h-2 w-2 fill-current text-orange-500" />
              </div>
            )}
            
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className={cn(
                "p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-opacity",
                tab.isDirty ? "opacity-0 group-hover:opacity-100" : "opacity-60 hover:opacity-100"
              )}
              title="Close (Middle click)"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* New Tab Button */}
      <div className="flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewTab}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="New Tab (⌘T)"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Hook for managing editor tabs
export function useEditorTabs() {
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: 'welcome',
      title: 'Welcome',
      content: '# Welcome to GitBook Editor\n\nStart typing to create your document...',
      isDirty: false,
      isActive: true,
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('welcome');

  const createNewTab = (title = 'Untitled', content = '', filePath?: string) => {
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      title,
      content,
      filePath,
      isDirty: false,
      isActive: false,
    };
    
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat({ ...newTab, isActive: true }));
    setActiveTabId(newTab.id);
    
    return newTab.id;
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      if (filtered.length === 0) {
        // Create a new tab if all tabs are closed
        const newTab: EditorTab = {
          id: `tab-${Date.now()}`,
          title: 'Untitled',
          content: '',
          isDirty: false,
          isActive: true,
        };
        setActiveTabId(newTab.id);
        return [newTab];
      }
      
      // If active tab was closed, activate another tab
      if (tabId === activeTabId) {
        const currentIndex = prev.findIndex(tab => tab.id === tabId);
        const nextTab = filtered[currentIndex] || filtered[currentIndex - 1] || filtered[0];
        setActiveTabId(nextTab.id);
      }
      
      return filtered;
    });
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === tabId })));
  };

  const updateTabContent = (tabId: string, content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, isDirty: true }
        : tab
    ));
  };

  const saveTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, isDirty: false }
        : tab
    ));
  };

  const openFileInTab = (filePath: string, content: string) => {
    // Check if file is already open
    const existingTab = tabs.find(tab => tab.filePath === filePath);
    if (existingTab) {
      switchTab(existingTab.id);
      return existingTab.id;
    }

    // Create new tab for file
    const fileName = filePath.split('/').pop() || 'File';
    return createNewTab(fileName, content, filePath);
  };

  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

  return {
    tabs,
    activeTabId,
    createNewTab,
    closeTab,
    switchTab,
    updateTabContent,
    saveTab,
    openFileInTab,
    getActiveTab,
  };
}