'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { EditorToolbar } from './EditorToolbar';
import { PreviewPane, PreviewPaneRef } from './PreviewPane';
import { TableOfContents } from './TableOfContents';
import { EditorTabs, useEditorTabs } from './EditorTabs';
import { FindReplaceModal } from './FindReplaceModal';
import { ImageManager } from './ImageManager';
import imageCompression from 'browser-image-compression';
import type { ImageData } from '@/types';
import { setupMarkdownLanguage } from '@/lib/monaco-markdown';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
});

interface MarkdownEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
  documentPath?: string;
}

export function MarkdownEditor({
  initialContent = '',
  onSave,
  onContentChange,
}: MarkdownEditorProps) {
  // Tab management
  const {
    tabs,
    activeTabId,
    createNewTab,
    closeTab,
    switchTab,
    updateTabContent,
    saveTab,
    getActiveTab,
  } = useEditorTabs();

  // Initialize with initial content if provided
  useEffect(() => {
    if (initialContent && tabs.length === 1 && tabs[0].id === 'welcome') {
      updateTabContent('welcome', initialContent);
    }
  }, [initialContent, tabs, updateTabContent]);

  const activeTab = getActiveTab();
  const content = activeTab?.content || '';

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);

  // Monaco Editor reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  
  // Preview pane reference for scroll sync
  const previewRef = useRef<PreviewPaneRef>(null);

  // Auto-save functionality
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll sync state
  const [isScrollSyncEnabled, setIsScrollSyncEnabled] = useState(true);
  const scrollSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useMemo(() => {
    return (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        if (onSave) {
          setIsSaving(true);
          try {
            await onSave(content);
            setLastSaved(new Date());
          } catch (error) {
            console.error('Failed to save:', error);
          } finally {
            setIsSaving(false);
          }
        }
      }, 1000);
    };
  }, [onSave]);

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || '';
    if (activeTab) {
      updateTabContent(activeTab.id, newContent);
      onContentChange?.(newContent);
      debouncedSave(newContent);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Setup markdown language features
    setupMarkdownLanguage(monaco);

    // Enable word-based suggestions
    editor.updateOptions({
      wordBasedSuggestions: 'allDocuments',
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on'
    });

    // Add scroll sync for editor -> preview
    if (isScrollSyncEnabled) {
      editor.onDidScrollChange(() => {
        if (scrollSyncTimeoutRef.current) {
          clearTimeout(scrollSyncTimeoutRef.current);
        }
        
        scrollSyncTimeoutRef.current = setTimeout(() => {
          const visibleRange = editor.getVisibleRanges()[0];
          
          if (visibleRange && previewRef.current) {
            // Calculate scroll ratio based on visible lines
            const totalLines = editor.getModel()?.getLineCount() || 1;
            const scrollRatio = (visibleRange.startLineNumber - 1) / Math.max(totalLines - 1, 1);
            previewRef.current.scrollToPosition(scrollRatio);
          }
        }, 50); // 50ms debounce for smooth scrolling
      });
    }
  };

  // Handle TOC heading click
  const handleTOCHeadingClick = useCallback((lineNumber: number) => {
    if (editorRef.current) {
      editorRef.current.revealLine(lineNumber, 1); // 1 = center
      editorRef.current.setPosition({ lineNumber, column: 1 });
      editorRef.current.focus();
    }
  }, []);

  // Handle preview scroll sync -> editor
  const handlePreviewScroll = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
    if (!isScrollSyncEnabled || !editorRef.current) return;

    if (scrollSyncTimeoutRef.current) {
      clearTimeout(scrollSyncTimeoutRef.current);
    }

    scrollSyncTimeoutRef.current = setTimeout(() => {
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      
      const totalLines = editorRef.current.getModel()?.getLineCount() || 1;
      const targetLine = Math.max(1, Math.floor(scrollRatio * totalLines));
      
      editorRef.current.revealLine(targetLine, 1); // 1 = center
    }, 50);
  }, [isScrollSyncEnabled]);

  const insertTextAtCursor = useCallback((text: string) => {
    if (editorRef.current && activeTab) {
      const position = editorRef.current.getPosition();
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };
      
      editorRef.current.executeEdits('insert-text', [
        {
          range: range,
          text: text,
        },
      ]);
      
      // Focus back to editor after insertion
      editorRef.current.focus();
    } else if (activeTab) {
      // Fallback for when Monaco isn't ready
      updateTabContent(activeTab.id, activeTab.content + '\n' + text);
    }
  }, [activeTab, updateTabContent]);

  const getSelectedText = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      return editorRef.current.getModel().getValueInRange(selection);
    }
    return '';
  };

  const handleToolbarAction = useCallback((action: string, value?: string) => {
    if (!editorRef.current || !activeTab) {
      console.warn('Editor or active tab not available for action:', action);
      return;
    }

    try {
      const selectedText = getSelectedText();
      
      switch (action) {
        case 'bold':
          insertTextAtCursor(`**${selectedText || 'bold text'}**`);
          break;
        case 'italic':
          insertTextAtCursor(`*${selectedText || 'italic text'}*`);
          break;
        case 'link':
          insertTextAtCursor(`[${selectedText || 'link text'}](url)`);
          break;
        case 'image':
          insertTextAtCursor(`![alt text](image-url)`);
          break;
        case 'code':
          insertTextAtCursor(`\`${selectedText || 'code'}\``);
          break;
        case 'codeblock':
          insertTextAtCursor(`\`\`\`\n${selectedText || 'code block'}\n\`\`\``);
          break;
        case 'heading':
          insertTextAtCursor(`${'#'.repeat(parseInt(value || '1'))} ${selectedText || 'Heading'}`);
          break;
        case 'list':
          insertTextAtCursor(`- ${selectedText || 'List item'}`);
          break;
        case 'checklist':
          insertTextAtCursor(`- [ ] ${selectedText || 'Task item'}`);
          break;
        case 'quote':
          insertTextAtCursor(`> ${selectedText || 'Quote'}`);
          break;
        case 'table':
          insertTextAtCursor(`| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |`);
          break;
        case 'undo':
          editorRef.current.trigger('keyboard', 'undo', null);
          break;
        case 'redo':
          editorRef.current.trigger('keyboard', 'redo', null);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (error) {
      console.error('Error executing toolbar action:', action, error);
    }
  }, [activeTab, insertTextAtCursor, getSelectedText]);

  // Handle clipboard image paste
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        
        const file = item.getAsFile();
        if (file) {
          try {
            // 이미지 압축
            const compressedFile = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });

            // 업로드
            const formData = new FormData();
            formData.append('file', compressedFile);

            const response = await fetch('/api/images', {
              method: 'POST',
              body: formData,
            });

            const result = await response.json();
            
            if (result.success) {
              const imageData: ImageData = result.data;
              const markdown = `![${imageData.originalName}](${imageData.url})`;
              insertTextAtCursor(markdown);
            } else {
              console.error('Failed to upload image:', result.error);
            }
          } catch (error) {
            console.error('Error uploading pasted image:', error);
          }
        }
        break;
      }
    }
  }, [insertTextAtCursor]);

  const handleImageInsertFromManager = (markdown: string) => {
    insertTextAtCursor(markdown);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (scrollSyncTimeoutRef.current) {
        clearTimeout(scrollSyncTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (onSave && activeTab) {
          onSave(activeTab.content);
          saveTab(activeTab.id);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewMode(!isPreviewMode);
      }
      // Find & Replace shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        console.log('🔍 Opening Find Replace Modal (Cmd+F)');
        setIsFindReplaceOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        console.log('🔍 Opening Find Replace Modal (Cmd+H)');
        setIsFindReplaceOpen(true);
      }
      // Tab navigation shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        createNewTab();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault();
        if (tabs.length > 1 && activeTab) {
          closeTab(activeTab.id);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault();
        // Cycle through tabs
        const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : (currentIndex + 1) % tabs.length;
        switchTab(tabs[nextIndex].id);
      }
    };

    console.log('🎯 Registering keyboard shortcuts for MarkdownEditor');
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    
    return () => {
      console.log('🗑️ Unregistering keyboard shortcuts for MarkdownEditor');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [activeTab, onSave, isPreviewMode, handlePaste, createNewTab, closeTab, switchTab, tabs, activeTabId, saveTab, setIsFindReplaceOpen]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Editor Tabs */}
      <EditorTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={switchTab}
        onTabClose={closeTab}
        onNewTab={() => createNewTab()}
        onTabSave={(tabId) => {
          const tab = tabs.find(t => t.id === tabId);
          if (tab && onSave) {
            onSave(tab.content);
            saveTab(tabId);
          }
        }}
      />

      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <EditorToolbar 
          onAction={handleToolbarAction}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          onOpenImageManager={() => setIsImageManagerOpen(true)}
          onOpenFindReplace={() => setIsFindReplaceOpen(true)}
          isSaving={isSaving}
          isScrollSyncEnabled={isScrollSyncEnabled}
          onToggleScrollSync={() => setIsScrollSyncEnabled(!isScrollSyncEnabled)}
          showTOC={showTOC}
          onToggleTOC={() => setShowTOC(!showTOC)}
        />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div className={`${isPreviewMode ? 'hidden md:block' : 'block'} ${
          showTOC ? 'md:w-1/3' : isPreviewMode ? 'md:w-1/2' : 'w-full'
        } h-full`}>
          <MonacoEditor
            height="100%"
            language="markdown"
            theme="vs-dark"
            value={content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            key={activeTabId} // Force re-render when tab changes
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              tabSize: 2,
              automaticLayout: true,
              // Enhanced autocomplete settings
              wordBasedSuggestions: 'allDocuments',
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnCommitCharacter: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on',
              suggest: {
                insertMode: 'replace',
                showKeywords: true,
                showSnippets: true,
                showWords: true,
              },
              // Better editing experience
              autoIndent: 'advanced',
              formatOnPaste: true,
              formatOnType: true,
              matchBrackets: 'always',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              autoSurround: 'languageDefined',
            }}
          />
        </div>

        {/* Preview Pane */}
        {(isPreviewMode || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <div className={`${isPreviewMode ? 'w-full md:w-1/2' : 'hidden md:block'} ${
            showTOC ? 'md:w-1/3' : 'md:w-1/2'
          } h-full border-l border-gray-200 dark:border-gray-700`}>
            <PreviewPane 
              ref={previewRef}
              content={content} 
              onScroll={handlePreviewScroll}
            />
          </div>
        )}

        {/* TOC Pane */}
        {showTOC && (
          <div className="w-full md:w-1/3 h-full border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <TableOfContents 
              content={content}
              onHeadingClick={handleTOCHeadingClick}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {activeTab?.filePath && <span>{activeTab.filePath}</span>}
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            💡 클립보드에서 이미지를 붙여넣기할 수 있습니다
          </span>
          <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
            ⌘T: 새 탭 | ⌘W: 탭 닫기 | ⌘Tab: 탭 전환 | ⌘F: 찾기
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isSaving && <span>Saving...</span>}
          {lastSaved && !isSaving && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          <span>{content.length} characters</span>
          <span className="text-xs text-gray-500">
            {tabs.length} tab{tabs.length !== 1 ? 's' : ''} open
          </span>
        </div>
      </div>

      {/* Find & Replace Modal */}
      <FindReplaceModal
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        editor={editorRef.current}
      />

      {/* Image Manager Modal */}
      <ImageManager
        isOpen={isImageManagerOpen}
        onClose={() => setIsImageManagerOpen(false)}
        onImageInsert={handleImageInsertFromManager}
      />
    </div>
  );
}