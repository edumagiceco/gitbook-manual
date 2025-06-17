'use client';

import {
  ChevronRight,
  ChevronDown,
  File,
  FileText,
  FileCode,
  FileImage,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileTreeItem } from '@/types';

interface FileNodeProps {
  item: FileTreeItem;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: (path: string) => void;
  onSelect?: (item: FileTreeItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileTreeItem) => void;
  children?: React.ReactNode;
}

export function FileNode({
  item,
  level,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect,
  onContextMenu,
  children,
}: FileNodeProps) {
  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'md':
      case 'mdx':
        return FileText;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'json':
        return FileCode;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return FileImage;
      default:
        return File;
    }
  };

  const handleClick = () => {
    if (item.type === 'folder') {
      onToggleExpand(item.path);
    } else {
      onSelect?.(item);
    }
  };

  const Icon = item.type === 'folder' 
    ? (isExpanded ? FolderOpen : Folder)
    : getFileIcon(item.name);

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <>
      <div
        className={cn(
          "flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          isSelected && "bg-blue-100 dark:bg-blue-900/50"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, item)}
      >
        {item.type === 'folder' && (
          <ChevronIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
        )}
        <Icon className={cn(
          "h-4 w-4 mr-2",
          item.type === 'folder' 
            ? "text-blue-500 dark:text-blue-400" 
            : "text-gray-600 dark:text-gray-400"
        )} />
        <span className={cn(
          "flex-1 truncate",
          isSelected 
            ? "text-blue-900 dark:text-blue-100" 
            : "text-gray-700 dark:text-gray-300"
        )}>
          {item.name}
        </span>
        {item.isModified && (
          <span className="ml-2 text-orange-500 dark:text-orange-400">●</span>
        )}
      </div>
      {children}
    </>
  );
}