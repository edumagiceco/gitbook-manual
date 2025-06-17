import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// GET: Read a specific document
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const docPath = params.path.join('/');
    const fullPath = path.join(CONTENT_DIR, docPath);
    
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
    
    return NextResponse.json({
      success: true,
      data: {
        path: docPath,
        content,
        metadata,
      }
    });
  } catch (error) {
    console.error('Error reading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read document' },
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
    const docPath = params.path.join('/');
    const fullPath = path.join(CONTENT_DIR, docPath);
    const body = await request.json();
    const { content, metadata = {} } = body;
    
    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Read existing metadata
    const existingContent = await fs.readFile(fullPath, 'utf-8');
    const { data: existingMetadata } = matter(existingContent);
    
    // Update document with merged metadata
    const fileContent = matter.stringify(content, {
      ...existingMetadata,
      ...metadata,
      updatedAt: new Date().toISOString(),
    });
    
    await fs.writeFile(fullPath, fileContent, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      path: docPath
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update document' },
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
    const docPath = params.path.join('/');
    const fullPath = path.join(CONTENT_DIR, docPath);
    
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
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}