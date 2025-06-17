import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// POST: Rename file or folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldPath, newName } = body;

    if (!oldPath || !newName) {
      return NextResponse.json(
        { success: false, error: 'Old path and new name are required' },
        { status: 400 }
      );
    }

    const fullOldPath = path.join(CONTENT_DIR, oldPath);
    const directory = path.dirname(fullOldPath);
    const fullNewPath = path.join(directory, newName);
    
    // Check if old file/folder exists
    try {
      await fs.access(fullOldPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'File or folder not found' },
        { status: 404 }
      );
    }
    
    // Check if new name already exists
    try {
      await fs.access(fullNewPath);
      return NextResponse.json(
        { success: false, error: 'A file or folder with this name already exists' },
        { status: 409 }
      );
    } catch {
      // New name doesn't exist, which is what we want
    }
    
    // Rename the file/folder
    await fs.rename(fullOldPath, fullNewPath);
    
    const newPath = path.relative(CONTENT_DIR, fullNewPath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Renamed successfully',
      oldPath,
      newPath: '/' + newPath.replace(/\\/g, '/')
    });
  } catch (error) {
    console.error('Error renaming:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to rename' },
      { status: 500 }
    );
  }
}
