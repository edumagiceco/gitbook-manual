import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// POST: Create new folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: folderPath, name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Create full path for the new folder
    const basePath = folderPath && folderPath !== '/' ? folderPath : '';
    const fullFolderPath = path.join(CONTENT_DIR, basePath, name);
    
    // Check if folder already exists
    try {
      await fs.access(fullFolderPath);
      return NextResponse.json(
        { success: false, error: 'Folder already exists' },
        { status: 409 }
      );
    } catch {
      // Folder doesn't exist, which is what we want
    }
    
    // Create directory
    await fs.mkdir(fullFolderPath, { recursive: true });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Folder created successfully',
      path: path.join(basePath, name)
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
