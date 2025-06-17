'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { ImageData, ImageUploadProgress } from '@/types';

interface ImageUploadProps {
  onImageUploaded: (image: ImageData) => void;
  onImageInsert?: (markdown: string) => void;
  className?: string;
  maxFiles?: number;
  showGallery?: boolean;
}

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export function ImageUpload({
  onImageUploaded,
  onImageInsert,
  className = '',
  maxFiles = 10,
  showGallery = true,
}: ImageUploadProps) {
  const [uploads, setUploads] = useState<ImageUploadProgress[]>([]);
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    try {
      setIsCompressing(true);
      const compressedFile = await imageCompression(file, DEFAULT_COMPRESSION_OPTIONS);
      return compressedFile;
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      return file; // 압축 실패 시 원본 반환
    } finally {
      setIsCompressing(false);
    }
  };

  const uploadImage = useCallback(async (file: File, uploadId: string): Promise<ImageData | null> => {
    try {
      // 압축 처리
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append('file', compressedFile);

      // 업로드 상태 업데이트
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'uploading', progress: 0 }
          : upload
      ));

      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const result = await response.json();
      
      if (result.success) {
        // 업로드 완료
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, status: 'completed', progress: 100 }
            : upload
        ));

        return result.data;
      } else {
        throw new Error(result.error || '업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      
      // 에러 상태 업데이트
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'error', error: error instanceof Error ? error.message : '업로드 실패' }
          : upload
      ));
      
      return null;
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // 업로드 진행 상태 초기화
    const newUploads: ImageUploadProgress[] = acceptedFiles.map(file => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      progress: 0,
      status: 'processing',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // 각 파일 업로드 처리
    for (const [index, file] of acceptedFiles.entries()) {
      const uploadId = newUploads[index].id;
      
      const imageData = await uploadImage(file, uploadId);
      
      if (imageData) {
        setUploadedImages(prev => [...prev, imageData]);
        onImageUploaded(imageData);
        
        // 에디터에 마크다운 삽입 (옵션)
        if (onImageInsert) {
          const markdown = `![${imageData.originalName}](${imageData.url})`;
          onImageInsert(markdown);
        }
      }
    }

    // 3초 후 완료된 업로드들 제거
    setTimeout(() => {
      setUploads(prev => prev.filter(upload => 
        upload.status !== 'completed' && upload.status !== 'error'
      ));
    }, 3000);

  }, [onImageUploaded, onImageInsert, uploadImage]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const insertImage = (image: ImageData) => {
    if (onImageInsert) {
      const markdown = `![${image.originalName}](${image.url})`;
      onImageInsert(markdown);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 드롭존 */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isDragReject ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          {isCompressing ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>이미지 압축 중...</span>
            </div>
          ) : isDragActive ? (
            <p className="text-blue-600 font-medium">파일을 여기에 드롭하세요</p>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                이미지를 드래그하여 업로드하거나 클릭하여 선택하세요
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                JPG, PNG, GIF, WebP 파일 지원 (최대 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 업로드 진행 상태 */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">업로드 진행 상황</h4>
          {uploads.map((upload) => (
            <div key={upload.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {upload.fileName}
                  </span>
                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {upload.status === 'processing' && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-xs text-gray-500">압축 중...</span>
                    </>
                  )}
                  
                  {upload.status === 'uploading' && (
                    <>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{upload.progress}%</span>
                    </>
                  )}
                  
                  {upload.status === 'completed' && (
                    <span className="text-xs text-green-600 dark:text-green-400">✓ 완료</span>
                  )}
                  
                  {upload.status === 'error' && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      ✗ 오류: {upload.error}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드된 이미지 갤러리 */}
      {showGallery && uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">업로드된 이미지</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadedImages.map((image) => (
              <div key={image.id} className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.originalName}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => insertImage(image)}
                    className="opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>삽입</span>
                  </button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-white text-xs truncate">{image.originalName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}