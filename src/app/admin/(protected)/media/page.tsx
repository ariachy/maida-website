'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import { ConfirmModal } from '@/components/admin/Modal';

interface ImageFile {
  filename: string;
  path: string;
  thumbnailPath: string | null;
  folder: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  usageCount?: number;
}

export default function MediaLibraryPage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<ImageFile | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  // Get unique folders from images
  const folders = ['all', ...Array.from(new Set(images.map((img) => img.folder).filter(Boolean)))];

  // Filter images
  const filteredImages = images.filter((img) => {
    if (selectedFolder !== 'all' && img.folder !== selectedFolder) return false;
    if (searchQuery) {
      return img.filename.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/upload');
      if (!res.ok) throw new Error('Failed to load images');
      
      const data = await res.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const uploadedCount = { success: 0, failed: 0 };

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', selectedFolder === 'all' ? 'general' : selectedFolder);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Upload failed');
        }

        uploadedCount.success++;
      } catch (error) {
        console.error('Upload error:', error);
        uploadedCount.failed++;
      }
    }

    setUploading(false);
    
    if (uploadedCount.success > 0) {
      toast.success(`Uploaded ${uploadedCount.success} image${uploadedCount.success > 1 ? 's' : ''}`);
      loadImages();
    }
    
    if (uploadedCount.failed > 0) {
      toast.error(`Failed to upload ${uploadedCount.failed} image${uploadedCount.failed > 1 ? 's' : ''}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (image: ImageFile) => {
    try {
      const res = await fetch(`/api/admin/upload?path=${encodeURIComponent(image.path)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }

      toast.success('Image deleted');
      setImages((prev) => prev.filter((img) => img.path !== image.path));
      setSelectedImage(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Path copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A484]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Media Library</h1>
          <p className="text-[#6B6B6B] mt-1">
            Manage uploaded images • {images.length} total images
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#C4A484] hover:bg-[#B8956F] text-white rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Images
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] mb-6">
        <div className="p-4 flex flex-wrap items-center gap-4">
          {/* Folder filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#6B6B6B]">Folder:</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-[#D4C4B5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
            >
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder === 'all' ? 'All Folders' : folder}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images..."
              className="pl-9 pr-4 py-2 border border-[#D4C4B5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484] w-48"
            />
          </div>

          <div className="flex-1" />

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-[#F5F1EB] rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-[#6B6B6B]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-[#6B6B6B]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid/List */}
      {filteredImages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-[#D4C4B5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-[#6B6B6B]">
            {searchQuery ? 'No images match your search' : 'No images uploaded yet'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 text-sm font-medium text-[#C4A484] hover:text-[#B8956F]"
          >
            Upload your first image
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.path}
              onClick={() => setSelectedImage(image)}
              className="group relative bg-white rounded-lg shadow-sm border border-[#E5E5E5] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative bg-[#F5F1EB]">
                <Image
                  src={image.thumbnailPath || image.path}
                  alt={image.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-[#2C2C2C] truncate">{image.filename}</p>
                <p className="text-xs text-[#9CA3AF]">{formatFileSize(image.size)}</p>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(image.path);
                  }}
                  className="p-2 bg-white rounded-full text-[#2C2C2C] hover:bg-[#F5F1EB]"
                  title="Copy path"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(image);
                  }}
                  className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
          {filteredImages.map((image) => (
            <div
              key={image.path}
              onClick={() => setSelectedImage(image)}
              className="flex items-center gap-4 p-4 hover:bg-[#F9F9F9] cursor-pointer"
            >
              <div className="w-16 h-16 relative bg-[#F5F1EB] rounded overflow-hidden flex-shrink-0">
                <Image
                  src={image.thumbnailPath || image.path}
                  alt={image.filename}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#2C2C2C] truncate">{image.filename}</p>
                <p className="text-sm text-[#9CA3AF]">
                  {formatFileSize(image.size)}
                  {image.width && image.height && ` • ${image.width}×${image.height}`}
                  {' • '}{image.folder}
                </p>
              </div>
              <div className="text-sm text-[#9CA3AF]">
                {formatDate(image.uploadedAt)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(image.path);
                  }}
                  className="p-2 text-[#6B6B6B] hover:text-[#C4A484] hover:bg-[#F5F1EB] rounded-md"
                  title="Copy path"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(image);
                  }}
                  className="p-2 text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 rounded-md"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Detail Sidebar */}
      {selectedImage && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-[#E5E5E5] z-40">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
              <h3 className="font-medium text-[#2C2C2C]">Image Details</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 text-[#6B6B6B] hover:text-[#2C2C2C]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview */}
            <div className="p-4">
              <div className="aspect-video relative bg-[#F5F1EB] rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.path}
                  alt={selectedImage.filename}
                  fill
                  className="object-contain"
                  sizes="320px"
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Filename</label>
                <p className="text-sm text-[#2C2C2C] mt-1 break-all">{selectedImage.filename}</p>
              </div>
              
              <div>
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Path</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-[#2C2C2C] break-all flex-1">{selectedImage.path}</p>
                  <button
                    onClick={() => copyToClipboard(selectedImage.path)}
                    className="p-1 text-[#6B6B6B] hover:text-[#C4A484]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Size</label>
                  <p className="text-sm text-[#2C2C2C] mt-1">{formatFileSize(selectedImage.size)}</p>
                </div>
                {selectedImage.width && selectedImage.height && (
                  <div>
                    <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Dimensions</label>
                    <p className="text-sm text-[#2C2C2C] mt-1">{selectedImage.width}×{selectedImage.height}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Folder</label>
                <p className="text-sm text-[#2C2C2C] mt-1">{selectedImage.folder || 'root'}</p>
              </div>

              <div>
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Uploaded</label>
                <p className="text-sm text-[#2C2C2C] mt-1">{formatDate(selectedImage.uploadedAt)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#E5E5E5]">
              <button
                onClick={() => setDeleteConfirm(selectedImage)}
                className="w-full px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDelete(deleteConfirm);
          }
          setDeleteConfirm(null);
        }}
        title="Delete Image"
        message={`Are you sure you want to delete "${deleteConfirm?.filename}"? This action cannot be undone.`}
        confirmText="Delete"
        danger
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
