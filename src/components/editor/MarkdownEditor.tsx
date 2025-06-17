'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { EditorToolbar } from './EditorToolbar';
import { PreviewPane } from './PreviewPane';

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
  documentPath
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setContent(newContent);
    onContentChange?.(newContent);
    debouncedSave(newContent);
  };

  const handleToolbarAction = (action: string, value?: string) => {
    // Handle toolbar actions
    switch (action) {
      case 'bold':
        insertText(`**${getSelectedText() || 'bold text'}**`);
        break;
      case 'italic':
        insertText(`*${getSelectedText() || 'italic text'}*`);
        break;
      case 'link':
        insertText(`[${getSelectedText() || 'link text'}](url)`);
        break;
      case 'image':
        insertText(`![alt text](image-url)`);
        break;
      case 'code':
        insertText(`\`${getSelectedText() || 'code'}\``);
        break;
      case 'codeblock':
        insertText(`\`\`\`\n${getSelectedText() || 'code block'}\n\`\`\``);
        break;
      case 'heading':
        insertText(`${'#'.repeat(parseInt(value || '1'))} ${getSelectedText() || 'Heading'}`);
        break;
      case 'list':
        insertText(`- ${getSelectedText() || 'List item'}`);
        break;
      case 'checklist':
        insertText(`- [ ] ${getSelectedText() || 'Task item'}`);
        break;
      case 'quote':
        insertText(`> ${getSelectedText() || 'Quote'}`);
        break;
      case 'table':
        insertText(`| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |`);
        break;
    }
  };

  const insertText = (text: string) => {
    // This is a placeholder - in real implementation, 
    // we'd use Monaco's API to insert at cursor position
    setContent(content + '\n' + text);
  };

  const getSelectedText = () => {
    // Placeholder for getting selected text from Monaco
    return '';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave(content);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsPreviewMode(!isPreviewMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, onSave, isPreviewMode]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <EditorToolbar 
          onAction={handleToolbarAction}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          isSaving={isSaving}
        />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div className={`${isPreviewMode ? 'hidden md:block md:w-1/2' : 'w-full'} h-full`}>
          <MonacoEditor
            height="100%"
            language="markdown"
            theme="vs-dark"
            value={content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Preview Pane */}
        {(isPreviewMode || window.innerWidth >= 768) && (
          <div className={`${isPreviewMode ? 'w-full md:w-1/2' : 'hidden md:block md:w-1/2'} h-full border-l border-gray-200 dark:border-gray-700`}>
            <PreviewPane content={content} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <div>
          {documentPath && <span>{documentPath}</span>}
        </div>
        <div className="flex items-center gap-4">
          {isSaving && <span>Saving...</span>}
          {lastSaved && !isSaving && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          <span>{content.length} characters</span>
        </div>
      </div>
    </div>
  );
}