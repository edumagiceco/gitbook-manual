'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Download, Trash2, Copy, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import type { ImageData } from '@/types';

interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert: (markdown: string) => void;
}

export function ImageManager({ isOpen, onClose, onImageInsert }: ImageManagerProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // 이미지 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = images;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.alt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 타입 필터링
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(image => image.type.includes(selectedFilter));
    }

    setFilteredImages(filtered);
  }, [images, searchTerm, selectedFilter]);

  const loadImages = async () => {
    try {
      const response = await fetch('/api/images');
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data || []);
      }
    } catch (error) {
      console.error('이미지 목록 로드 실패:', error);
    }
  };

  const handleImageUploaded = (newImage: ImageData) => {
    setImages(prev => [newImage, ...prev]);
  };

  const handleImageInsert = (image: ImageData) => {
    const markdown = `![${image.alt || image.originalName}](${image.url})`;
    onImageInsert(markdown);
    onClose();
  };

  const handleCopyUrl = (image: ImageData) => {
    navigator.clipboard.writeText(image.url);
    // TODO: 토스트 알림 추가
  };

  const handleDownload = (image: ImageData) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 백드롭 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              이미지 관리
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 flex overflow-hidden">
            {/* 사이드바 */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {/* 업로드 섹션 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  새 이미지 업로드
                </h3>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  showGallery={false}
                  className="scale-75"
                />
              </div>

              {/* 검색 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  검색
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="이미지 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 필터 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  파일 타입
                </h3>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">모든 타입</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="gif">GIF</option>
                  <option value="webp">WebP</option>
                </select>
              </div>

              {/* 보기 옵션 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  보기
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors ${
                      view === 'grid'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    그리드
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`flex-1 p-2 rounded-md text-sm font-medium transition-colors ${
                      view === 'list'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    목록
                  </button>
                </div>
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1 flex flex-col">
              {/* 툴바 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredImages.length}개의 이미지
                  {selectedImages.size > 0 && ` (${selectedImages.size}개 선택됨)`}
                </div>
                
                {selectedImages.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 이미지 그리드/목록 */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <ImageIcon className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">이미지가 없습니다</p>
                    <p className="text-sm">왼쪽에서 새 이미지를 업로드해보세요</p>
                  </div>
                ) : view === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredImages.map((image) => (
                      <div
                        key={image.id}
                        className={`group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                          selectedImages.has(image.id) ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => toggleImageSelection(image.id)}
                      >
                        <img
                          src={image.url}
                          alt={image.originalName}
                          className="w-full h-full object-cover"
                        />
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageInsert(image);
                              }}
                              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              삽입
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyUrl(image);
                              }}
                              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image);
                              }}
                              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                          <p className="text-white text-xs truncate">{image.originalName}</p>
                          <p className="text-white text-xs opacity-75">{formatFileSize(image.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredImages.map((image) => (
                      <div
                        key={image.id}
                        className={`flex items-center space-x-4 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          selectedImages.has(image.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => toggleImageSelection(image.id)}
                      >
                        <img
                          src={image.url}
                          alt={image.originalName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {image.originalName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(image.size)} • {image.type}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageInsert(image);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                          >
                            삽입
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(image);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}