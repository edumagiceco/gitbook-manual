import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

// Get content directory from environment variable
const getContentDir = () => {
  const contentDir = process.env.CONTENT_DIR || 'content';
  return path.join(process.cwd(), contentDir);
};

// Validate and sanitize document path
function validateDocPath(docPath: string): string | null {
  // Prevent directory traversal
  if (docPath.includes('..') || docPath.startsWith('/')) {
    return null;
  }
  
  // Ensure it's a valid markdown file
  if (!docPath.endsWith('.md') && !docPath.endsWith('.mdx')) {
    docPath = docPath + '.md';
  }
  
  return docPath;
}

// GET: Read a specific document
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const rawPath = params.path.join('/');
    const docPath = validateDocPath(rawPath);
    
    if (!docPath) {
      return NextResponse.json(
        { success: false, error: 'Invalid document path' },
        { status: 400 }
      );
    }
    
    const contentDir = getContentDir();
    const fullPath = path.join(contentDir, docPath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Read file content
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const { data: metadata, content } = matter(fileContent);
    
    // Get file stats for additional metadata
    const stats = await fs.stat(fullPath);
    
    return NextResponse.json({
      success: true,
      data: {
        path: docPath,
        content,
        metadata: {
          ...metadata,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          created: stats.birthtime.toISOString(),
        },
      }
    });
  } catch (error) {
    console.error('Error reading document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update a document
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const rawPath = params.path.join('/');
    const docPath = validateDocPath(rawPath);
    
    if (!docPath) {
      return NextResponse.json(
        { success: false, error: 'Invalid document path' },
        { status: 400 }
      );
    }
    
    const contentDir = getContentDir();
    const fullPath = path.join(contentDir, docPath);
    const body = await request.json();
    const { content, metadata = {} } = body;
    
    if (typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content must be a string' },
        { status: 400 }
      );
    }
    
    // Check if file exists
    let existingMetadata = {};
    try {
      const existingContent = await fs.readFile(fullPath, 'utf-8');
      const { data } = matter(existingContent);
      existingMetadata = data;
    } catch {
      // File doesn't exist, will be created
    }
    
    // Update document with merged metadata
    const fileContent = matter.stringify(content, {
      ...existingMetadata,
      ...metadata,
      updatedAt: new Date().toISOString(),
    });
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(fullPath, fileContent, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      path: docPath
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a document
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const rawPath = params.path.join('/');
    const docPath = validateDocPath(rawPath);
    
    if (!docPath) {
      return NextResponse.json(
        { success: false, error: 'Invalid document path' },
        { status: 400 }
      );
    }
    
    const contentDir = getContentDir();
    const fullPath = path.join(contentDir, docPath);
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Delete the file
    await fs.unlink(fullPath);
    
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      path: docPath
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}