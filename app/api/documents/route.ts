import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// Get content directory from environment variable
const getContentDir = () => {
  const contentDir = process.env.CONTENT_DIR || 'content';
  return path.join(process.cwd(), contentDir);
};

// Ensure content directory exists
async function ensureContentDir() {
  const contentDir = getContentDir();
  try {
    await fs.access(contentDir);
  } catch {
    await fs.mkdir(contentDir, { recursive: true });
  }
}

// Get file tree structure
async function getFileTree(dir: string): Promise<Array<{
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: Array<{
    id: string;
    name: string;
    path: string;
    type: 'folder' | 'file';
  }>;
}>> {
  const items = [];
  const contentDir = getContentDir();
  
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);
      const relativePath = path.relative(contentDir, filePath);
      
      if (file.isDirectory()) {
        items.push({
          id: relativePath,
          name: file.name,
          path: '/' + relativePath,
          type: 'folder' as const,
          children: await getFileTree(filePath),
        });
      } else if (file.name.endsWith('.md') || file.name.endsWith('.mdx')) {
        items.push({
          id: relativePath,
          name: file.name,
          path: '/' + relativePath,
          type: 'file' as const,
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    // Return empty array if directory doesn't exist or is inaccessible
    return [];
  }

  return items;
}

// GET: List all documents
export async function GET() {
  try {
    await ensureContentDir();
    const contentDir = getContentDir();
    const tree = await getFileTree(contentDir);
    
    return NextResponse.json({ 
      success: true, 
      data: tree,
      contentDir: process.env.CONTENT_DIR || 'content' // For debugging
    });
  } catch (error) {
    console.error('Error reading documents:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: docPath, content = '', metadata = {} } = body;

    if (!docPath) {
      return NextResponse.json(
        { success: false, error: 'Path is required' },
        { status: 400 }
      );
    }

    // Validate path to prevent directory traversal
    if (docPath.includes('..') || docPath.startsWith('/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      );
    }

    await ensureContentDir();
    const contentDir = getContentDir();
    
    const fullPath = path.join(contentDir, docPath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    await fs.mkdir(dir, { recursive: true });
    
    // Create document with frontmatter
    const fileContent = matter.stringify(content, {
      ...metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    await fs.writeFile(fullPath, fileContent, 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Document created successfully',
      path: docPath 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}