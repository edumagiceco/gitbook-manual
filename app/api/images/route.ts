import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, stat } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get upload directory from environment variable
const getUploadDir = () => {
  const imagesDir = process.env.IMAGES_DIR || 'public/uploads/images';
  return path.join(process.cwd(), imagesDir);
};

// Configuration from environment variables
const config = {
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  urlPrefix: '/uploads/images',
};

async function ensureUploadDir() {
  const uploadDir = getUploadDir();
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    throw new Error('Could not create upload directory');
  }
}

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`
    };
  }

  if (file.size > config.maxFileSize) {
    const maxSizeMB = Math.round(config.maxFileSize / (1024 * 1024));
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB.`
    };
  }

  return { valid: true };
}

function generateFileName(originalName: string): string {
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0]; // Use first part of UUID for shorter name
  return `${timestamp}_${uuid}${fileExtension}`;
}

async function getImageList() {
  try {
    await ensureUploadDir();
    const uploadDir = getUploadDir();
    const files = await readdir(uploadDir);
    
    const imagePromises = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(async (fileName) => {
        const filePath = path.join(uploadDir, fileName);
        const stats = await stat(filePath);
        
        // 파일 확장자에서 MIME 타입 결정
        const ext = path.extname(fileName).toLowerCase();
        let mimeType = 'image/jpeg';
        switch (ext) {
          case '.png': mimeType = 'image/png'; break;
          case '.gif': mimeType = 'image/gif'; break;
          case '.webp': mimeType = 'image/webp'; break;
          case '.jpg':
          case '.jpeg': mimeType = 'image/jpeg'; break;
        }
        
        return {
          id: fileName.replace(path.extname(fileName), ''),
          originalName: fileName,
          fileName: fileName,
          url: `${config.urlPrefix}/${fileName}`,
          size: stats.size,
          type: mimeType,
          uploadedAt: stats.birthtime.toISOString(),
          lastModified: stats.mtime.toISOString(),
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
    // Feature flag check
    if (process.env.ENABLE_IMAGE_UPLOAD === 'false') {
      return NextResponse.json(
        { success: false, error: 'Image upload is disabled' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 검증
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 디렉토리 생성
    await ensureUploadDir();

    // 고유한 파일명 생성
    const fileName = generateFileName(file.name);
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, fileName);
    
    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 웹에서 접근 가능한 URL 생성
    const imageUrl = `${config.urlPrefix}/${fileName}`;
    
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
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Feature flag check
    if (process.env.ENABLE_IMAGE_UPLOAD === 'false') {
      return NextResponse.json(
        { success: false, error: 'Image upload is disabled' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    
    let images = await getImageList();
    
    // 검색 필터링
    if (search) {
      images = images.filter(image => 
        image.originalName.toLowerCase().includes(search.toLowerCase()) ||
        image.fileName.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 제한 적용
    if (limit > 0) {
      images = images.slice(0, limit);
    }
    
    return NextResponse.json({
      success: true,
      data: images,
      count: images.length,
      config: {
        maxFileSize: config.maxFileSize,
        allowedTypes: config.allowedTypes,
      }
    });
  } catch (error) {
    console.error('Failed to get images:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}