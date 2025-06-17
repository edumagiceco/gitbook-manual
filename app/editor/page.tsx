'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FileTree } from '@/components/file-explorer/FileTree';
import { ChevronLeft, ChevronRight, FileText, FolderPlus } from 'lucide-react';
import type { FileTreeItem, Document } from '@/types';

// Dynamic import for MarkdownEditor to avoid SSR issues
const MarkdownEditor = dynamic(
  () => import('@/components/editor/MarkdownEditor').then(mod => mod.MarkdownEditor),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
  }
);

// API functions
async function fetchDocuments() {
  try {
    const response = await fetch('/api/documents');
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return [];
  }
}

async function fetchDocument(path: string) {
  try {
    const response = await fetch(`/api/documents${path}`);
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return null;
  }
}

async function saveDocument(path: string, content: string, metadata = {}) {
  try {
    const response = await fetch(`/api/documents${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, metadata }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to save document:', error);
    return false;
  }
}

async function createDocument(path: string, content: string = '', metadata = {}) {
  try {
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content, metadata }),
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to create document:', error);
    return false;
  }
}

export default function EditorPage() {
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load documents on mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await fetchDocuments();
        setFileTree(docs.length > 0 ? docs : [
          {
            id: 'getting-started',
            name: 'Getting Started',
            path: '/getting-started',
            type: 'folder',
            children: [
              {
                id: 'welcome',
                name: 'welcome.md',
                path: '/getting-started/welcome.md',
                type: 'file',
              }
            ]
          }
        ]);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const handleFileSelect = async (item: FileTreeItem) => {
    if (item.type === 'file') {
      setIsLoading(true);
      try {
        const doc = await fetchDocument(item.path);
        
        if (doc) {
          setActiveDocument({
            id: item.id,
            path: item.path,
            title: item.name,
            content: doc.content || '',
            metadata: doc.metadata,
            createdAt: new Date(doc.metadata?.createdAt || Date.now()),
            updatedAt: new Date(doc.metadata?.updatedAt || Date.now()),
          });
        } else {
          // If document doesn't exist, create a new one
          const newContent = `# ${item.name}\n\nStart writing your documentation here...`;
          setActiveDocument({
            id: item.id,
            path: item.path,
            title: item.name,
            content: newContent,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async (content: string) => {
    if (!activeDocument) return;

    const success = await saveDocument(activeDocument.path, content, activeDocument.metadata);
    
    if (success) {
      setActiveDocument({
        ...activeDocument,
        content,
        updatedAt: new Date(),
      });
    }
  };

  const handleCreateFile = async (parentPath: string) => {
    const fileName = prompt('Enter file name (with .md extension):');
    if (!fileName) return;

    const fullPath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
    const success = await createDocument(fullPath);
    
    if (success) {
      // Reload file tree
      const docs = await fetchDocuments();
      setFileTree(docs);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    // For now, just show a message
    alert('Folder creation will be implemented soon!');
  };

  const handleRename = () => {
    alert('Rename functionality will be implemented soon!');
  };

  const handleDelete = (item: FileTreeItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      alert('Delete functionality will be implemented soon!');
    }
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Files</h2>
          <div className="flex items-center gap-2">
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="New File"
              onClick={() => handleCreateFile('/')}
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="New Folder"
              onClick={() => handleCreateFolder()}
            >
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
              Loading files...
            </div>
          ) : fileTree.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
              <p className="mb-2">No files yet</p>
              <button
                onClick={() => handleCreateFile('/')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create your first document
              </button>
            </div>
          ) : (
            <FileTree
              items={fileTree}
              selectedPath={activeDocument?.path}
              onSelect={handleFileSelect}
              onCreateFile={handleCreateFile}
              onCreateFolder={() => handleCreateFolder()}
              onRename={() => handleRename()}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Sidebar Toggle */}
      <div className="relative">
        <button
          className="absolute left-full top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-md p-1 shadow-md transition-all duration-300"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">Loading...</p>
            </div>
          </div>
        ) : activeDocument ? (
          <MarkdownEditor
            key={activeDocument.id}
            initialContent={activeDocument.content}
            documentPath={activeDocument.path}
            onSave={handleSave}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">No document selected</p>
              <p className="text-sm mb-4">Select a file from the sidebar or create a new one</p>
              <button
                onClick={() => handleCreateFile('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}