'use client';

import {
  Bold,
  Italic,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Quote,
  Table,
  Eye,
  EyeOff,
  Undo,
  Redo,
  FileCode,
  ImagePlus,
  Link2,
  Hash,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  onAction: (action: string, value?: string) => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onOpenImageManager?: () => void;
  onOpenFindReplace?: () => void;
  isSaving?: boolean;
  isScrollSyncEnabled?: boolean;
  onToggleScrollSync?: () => void;
  showTOC?: boolean;
  onToggleTOC?: () => void;
}

export function EditorToolbar({
  onAction,
  isPreviewMode,
  onTogglePreview,
  onOpenImageManager,
  onOpenFindReplace,
  isSaving,
  isScrollSyncEnabled = true,
  onToggleScrollSync,
  showTOC = false,
  onToggleTOC,
}: EditorToolbarProps) {
  const handleButtonClick = (action?: string, value?: string, customOnClick?: () => void) => {
    if (customOnClick) {
      customOnClick();
    } else if (action) {
      onAction(action, value);
    }
  };

  const ToolButton = ({
    icon: Icon,
    action,
    title,
    value,
    onClick,
  }: {
    icon: React.ElementType;
    action?: string;
    title: string;
    value?: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleButtonClick(action, value, onClick);
      }}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={title}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  const Separator = () => (
    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
  );

  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div className="flex items-center gap-1">
        {/* Text Formatting */}
        <ToolButton icon={Bold} action="bold" title="Bold (⌘B)" />
        <ToolButton icon={Italic} action="italic" title="Italic (⌘I)" />
        <ToolButton icon={Code} action="code" title="Inline Code" />
        
        <Separator />
        
        {/* Headings */}
        <ToolButton icon={Heading1} action="heading" title="Heading 1" value="1" />
        <ToolButton icon={Heading2} action="heading" title="Heading 2" value="2" />
        <ToolButton icon={Heading3} action="heading" title="Heading 3" value="3" />
        
        <Separator />
        
        {/* Lists */}
        <ToolButton icon={List} action="list" title="Bullet List" />
        <ToolButton icon={CheckSquare} action="checklist" title="Task List" />
        <ToolButton icon={Quote} action="quote" title="Quote" />
        
        <Separator />
        
        {/* Insert */}
        <ToolButton icon={Link} action="link" title="Insert Link (⌘K)" />
        <ToolButton 
          icon={Image} 
          action="image" 
          title="Insert Image URL" 
        />
        <ToolButton 
          icon={ImagePlus} 
          title="Image Manager - Upload & Insert Images"
          onClick={onOpenImageManager}
        />
        <ToolButton icon={Table} action="table" title="Insert Table" />
        <ToolButton icon={FileCode} action="codeblock" title="Code Block" />
        
        <Separator />
        
        {/* History */}
        <ToolButton icon={Undo} action="undo" title="Undo (⌘Z)" />
        <ToolButton icon={Redo} action="redo" title="Redo (⌘⇧Z)" />
        
        <Separator />
        
        {/* Find & Replace */}
        <ToolButton 
          icon={Search} 
          title="Find & Replace (⌘F)"
          onClick={onOpenFindReplace}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Status */}
        {isSaving && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Saving...
          </span>
        )}
        
        {/* TOC Toggle */}
        {onToggleTOC && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleTOC();
            }}
            className={cn(
              "p-2 rounded transition-colors",
              showTOC
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            )}
            title="Toggle Table of Contents"
          >
            <Hash className="h-4 w-4" />
          </button>
        )}
        
        {/* Scroll Sync Toggle */}
        {onToggleScrollSync && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleScrollSync();
            }}
            className={cn(
              "p-2 rounded transition-colors",
              isScrollSyncEnabled
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            )}
            title="Toggle Scroll Sync"
          >
            <Link2 className="h-4 w-4" />
          </button>
        )}
        
        {/* Preview Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePreview();
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors",
            isPreviewMode
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          title="Toggle Preview (⌘P)"
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}