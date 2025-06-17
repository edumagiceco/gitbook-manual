'use client';

import { useEffect, useRef } from 'react';
import {
  FileText,
  FolderPlus,
  Edit,
  Trash2,
  Copy,
  Scissors,
  Clipboard,
} from 'lucide-react';
import type { FileTreeItem, ContextMenuPosition } from '@/types';

interface ContextMenuProps {
  position: ContextMenuPosition;
  item: FileTreeItem;
  onAction: (action: string) => void;
  onClose: () => void;
}

export function ContextMenu({
  position,
  item,
  onAction,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const MenuItem = ({
    icon: Icon,
    label,
    action,
    shortcut,
    divider = false,
  }: {
    icon: React.ElementType;
    label: string;
    action: string;
    shortcut?: string;
    divider?: boolean;
  }) => (
    <>
      {divider && <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />}
      <button
        className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        onClick={() => {
          onAction(action);
          onClose();
        }}
      >
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span>{label}</span>
        </div>
        {shortcut && (
          <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">
            {shortcut}
          </span>
        )}
      </button>
    </>
  );

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50 min-w-[160px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {item.type === 'folder' && (
        <>
          <MenuItem
            icon={FileText}
            label="New File"
            action="new-file"
            shortcut="⌘N"
          />
          <MenuItem
            icon={FolderPlus}
            label="New Folder"
            action="new-folder"
            shortcut="⌘⇧N"
          />
        </>
      )}
      
      <MenuItem
        icon={Edit}
        label="Rename"
        action="rename"
        shortcut="F2"
        divider={item.type === 'folder'}
      />
      
      <MenuItem
        icon={Copy}
        label="Copy"
        action="copy"
        shortcut="⌘C"
      />
      
      <MenuItem
        icon={Scissors}
        label="Cut"
        action="cut"
        shortcut="⌘X"
      />
      
      {item.type === 'folder' && (
        <MenuItem
          icon={Clipboard}
          label="Paste"
          action="paste"
          shortcut="⌘V"
        />
      )}
      
      <MenuItem
        icon={Trash2}
        label="Delete"
        action="delete"
        shortcut="⌘⌫"
        divider
      />
    </div>
  );
}