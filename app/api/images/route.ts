import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 이미지 저장 디렉토리
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'images');

// 허용된 이미지 타입
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
}

async function getImageList() {
  try {
    await ensureUploadDir();
    const files = await readdir(UPLOAD_DIR);
    
    const imagePromises = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(async (fileName) => {
        const filePath = path.join(UPLOAD_DIR, fileName);
        const stats = await stat(filePath);
        
        // 파일 확장자에서 MIME 타입 결정
        const ext = path.extname(fileName).toLowerCase();
        let mimeType = 'image/jpeg';
        switch (ext) {
          case '.png': mimeType = 'image/png'; break;
          case '.gif': mimeType = 'image/gif'; break;
          case '.webp': mimeType = 'image/webp'; break;
        }
        
        return {
          id: fileName.replace(path.extname(fileName), ''),
          originalName: fileName,
          fileName: fileName,
          url: `/uploads/images/${fileName}`,
          size: stats.size,
          type: mimeType,
          uploadedAt: stats.birthtime.toISOString(),
        };
      });

    const images = await Promise.all(imagePromises);
    
    // 업로드 날짜 기준 내림차순 정렬
    images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    return images;
  } catch (error) {
    console.error('Failed to get image list:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // 디렉토리 생성
    await ensureUploadDir();

    // 고유한 파일명 생성
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 웹에서 접근 가능한 URL 생성
    const imageUrl = `/uploads/images/${fileName}`;
    
    // 이미지 메타데이터
    const imageData = {
      id: uuidv4(),
      originalName: file.name,
      fileName: fileName,
      url: imageUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: imageData,
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const images = await getImageList();
    
    return NextResponse.json({
      success: true,
      data: images,
      count: images.length,
    });
  } catch (error) {
    console.error('Failed to get images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve images' },
      { status: 500 }
    );
  }
}