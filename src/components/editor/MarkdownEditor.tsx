'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { EditorToolbar } from './EditorToolbar';
import { PreviewPane } from './PreviewPane';
import { ImageManager } from './ImageManager';
import imageCompression from 'browser-image-compression';
import type { ImageData } from '@/types';

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
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);

  // Monaco Editor reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const insertTextAtCursor = useCallback((text: string) => {
    if (editorRef.current) {
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
    } else {
      // Fallback for when Monaco isn't ready
      setContent(content + '\n' + text);
    }
  }, [content]);

  const getSelectedText = () => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      return editorRef.current.getModel().getValueInRange(selection);
    }
    return '';
  };

  const handleToolbarAction = (action: string, value?: string) => {
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
    }
  };

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
    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [content, onSave, isPreviewMode, handlePaste]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <EditorToolbar 
          onAction={handleToolbarAction}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          onOpenImageManager={() => setIsImageManagerOpen(true)}
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
            onMount={handleEditorDidMount}
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
        {(isPreviewMode || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <div className={`${isPreviewMode ? 'w-full md:w-1/2' : 'hidden md:block md:w-1/2'} h-full border-l border-gray-200 dark:border-gray-700`}>
            <PreviewPane content={content} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {documentPath && <span>{documentPath}</span>}
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            💡 클립보드에서 이미지를 붙여넣기할 수 있습니다
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isSaving && <span>Saving...</span>}
          {lastSaved && !isSaving && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          <span>{content.length} characters</span>
        </div>
      </div>

      {/* Image Manager Modal */}
      <ImageManager
        isOpen={isImageManagerOpen}
        onClose={() => setIsImageManagerOpen(false)}
        onImageInsert={handleImageInsertFromManager}
      />
    </div>
  );
}