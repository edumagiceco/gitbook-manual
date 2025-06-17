'use client';

import { useState, useCallback } from 'react';
import { FileNode } from './FileNode';
import { ContextMenu } from './ContextMenu';
import type { FileTreeItem, ContextMenuPosition } from '@/types';

interface FileTreeProps {
  items: FileTreeItem[];
  onSelect?: (item: FileTreeItem) => void;
  onCreateFile?: (parentPath: string) => void;
  onCreateFolder?: (parentPath: string) => void;
  onRename?: (item: FileTreeItem, newName: string) => void;
  onDelete?: (item: FileTreeItem) => void;
  selectedPath?: string;
}

export function FileTree({
  items,
  onSelect,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  selectedPath,
}: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    position: ContextMenuPosition;
    item: FileTreeItem;
  } | null>(null);

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: FileTreeItem) => {
      e.preventDefault();
      setContextMenu({
        position: { x: e.clientX, y: e.clientY },
        item,
      });
    },
    []
  );

  const handleContextMenuAction = useCallback(
    (action: string) => {
      if (!contextMenu) return;

      const { item } = contextMenu;
      
      switch (action) {
        case 'new-file':
          onCreateFile?.(item.type === 'folder' ? item.path : item.path.split('/').slice(0, -1).join('/'));
          break;
        case 'new-folder':
          onCreateFolder?.(item.type === 'folder' ? item.path : item.path.split('/').slice(0, -1).join('/'));
          break;
        case 'rename':
          const newName = prompt('Enter new name:', item.name);
          if (newName && newName !== item.name) {
            onRename?.(item, newName);
          }
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
            onDelete?.(item);
          }
          break;
      }

      setContextMenu(null);
    },
    [contextMenu, onCreateFile, onCreateFolder, onRename, onDelete]
  );

  const handleClickOutside = useCallback(() => {
    setContextMenu(null);
  }, []);

  const sortItems = (items: FileTreeItem[]): FileTreeItem[] => {
    return [...items].sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  };

  return (
    <>
      <div 
        className="file-tree select-none"
        onClick={handleClickOutside}
      >
        {sortItems(items).map((item) => (
          <FileNode
            key={item.path}
            item={item}
            level={0}
            isExpanded={expandedPaths.has(item.path)}
            isSelected={selectedPath === item.path}
            onToggleExpand={handleToggleExpand}
            onSelect={onSelect}
            onContextMenu={handleContextMenu}
          >
            {item.children && expandedPaths.has(item.path) && (
              <div className="ml-2">
                {sortItems(item.children).map((child) => (
                  <FileNode
                    key={child.path}
                    item={child}
                    level={1}
                    isExpanded={expandedPaths.has(child.path)}
                    isSelected={selectedPath === child.path}
                    onToggleExpand={handleToggleExpand}
                    onSelect={onSelect}
                    onContextMenu={handleContextMenu}
                  >
                    {child.children && expandedPaths.has(child.path) && (
                      <div className="ml-2">
                        {sortItems(child.children).map((grandchild) => (
                          <FileNode
                            key={grandchild.path}
                            item={grandchild}
                            level={2}
                            isExpanded={expandedPaths.has(grandchild.path)}
                            isSelected={selectedPath === grandchild.path}
                            onToggleExpand={handleToggleExpand}
                            onSelect={onSelect}
                            onContextMenu={handleContextMenu}
                          />
                        ))}
                      </div>
                    )}
                  </FileNode>
                ))}
              </div>
            )}
          </FileNode>
        ))}
      </div>

      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          item={contextMenu.item}
          onAction={handleContextMenuAction}
          onClose={handleClickOutside}
        />
      )}
    </>
  );
}