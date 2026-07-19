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
  usedIn?: string[];
  isSystemImage?: boolean;
}

export default function MediaLibraryPage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<ImageFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<ImageFile | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [showSystemImages, setShowSystemImages] = useState(true);
  const [imageToReplace, setImageToReplace] = useState<ImageFile | null>(null);

  // Filter images
  const filteredImages = images.filter((img) => {
    if (!showSystemImages && img.isSystemImage) return false;
    if (selectedFolder !== 'all' && img.folder !== selectedFolder) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        img.filename.toLowerCase().includes(query) ||
        img.folder.toLowerCase().includes(query) ||
        (img.usedIn && img.usedIn.some(u => u.toLowerCase().includes(query)))
      );
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
      setFolders(data.folders || []);
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
        // Determine folder based on selection
        const folder = selectedFolder === 'all' ? 'general' : selectedFolder;
        formData.append('folder', folder);

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReplace = async (file: File) => {
    if (!imageToReplace) return;
    
    setReplacing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('replacePath', imageToReplace.path);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Replace failed');
      }

      toast.success('Image replaced successfully');
      loadImages();
      setSelectedImage(null);
      setImageToReplace(null);
    } catch (error) {
      console.error('Replace error:', error);
      toast.error('Failed to replace image');
    } finally {
      setReplacing(false);
      if (replaceInputRef.current) {
        replaceInputRef.current.value = '';
      }
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
      toast.error(error instanceof Error ? error.message : 'Failed to delete image');
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

  // Group images by folder for display
  const groupedByFolder = filteredImages.reduce((acc, img) => {
    const folder = img.folder || 'root';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(img);
    return acc;
  }, {} as Record<string, ImageFile[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A484]" />
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleReplace(e.target.files[0])}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-[#2C2C2C]">Media Library</h1>
          <p className="text-[#6B6B6B] mt-1">
            All website images • {images.length} total ({images.filter(i => i.isSystemImage).length} system, {images.filter(i => !i.isSystemImage).length} uploaded)
          </p>
        </div>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] mb-6">
        <div className="p-4 flex flex-wrap items-center gap-4">
          {/* Folder filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#6B6B6B]">Folder:</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-1.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484] focus:border-transparent"
            >
              <option value="all">All Folders</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
          </div>

          {/* Show system images toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSystemImages}
              onChange={(e) => setShowSystemImages(e.target.checked)}
              className="w-4 h-4 text-[#C4A484] border-[#E5E5E5] rounded focus:ring-[#C4A484]"
            />
            <span className="text-sm text-[#6B6B6B]">Show system images</span>
          </label>

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search images or usage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484] focus:border-transparent"
              />
            </div>
          </div>

          {/* View mode */}
          <div className="flex items-center border border-[#E5E5E5] rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-[#F5F1EB] text-[#C4A484]' : 'text-[#6B6B6B] hover:bg-[#F9F9F9]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-[#F5F1EB] text-[#C4A484]' : 'text-[#6B6B6B] hover:bg-[#F9F9F9]'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* No images */}
      {filteredImages.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-[#E5E5E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-[#6B6B6B]">No images found</p>
        </div>
      )}

      {/* Images grouped by folder */}
      {Object.entries(groupedByFolder).map(([folder, folderImages]) => (
        <div key={folder} className="mb-8">
          <h2 className="text-lg font-medium text-[#2C2C2C] mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C4A484]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {folder}
            <span className="text-sm font-normal text-[#9CA3AF]">({folderImages.length})</span>
          </h2>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {folderImages.map((image) => (
                <div
                  key={image.path}
                  onClick={() => setSelectedImage(image)}
                  className={`group bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    image.isSystemImage ? 'border-[#C4A484]/30' : 'border-[#E5E5E5]'
                  }`}
                >
                  <div className="aspect-square relative bg-[#F5F1EB]">
                    {image.path.endsWith('.svg') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.path}
                        alt={image.filename}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <Image
                        src={image.thumbnailPath || image.path}
                        alt={image.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    )}
                    {/* System image badge */}
                    {image.isSystemImage && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#C4A484] text-white text-[10px] rounded">
                        System
                      </div>
                    )}
                    {/* Usage indicator */}
                    {image.usedIn && image.usedIn.length > 0 && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded">
                        In use
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-[#2C2C2C] truncate" title={image.filename}>{image.filename}</p>
                    <p className="text-xs text-[#9CA3AF]">{formatFileSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
              {folderImages.map((image) => (
                <div
                  key={image.path}
                  onClick={() => setSelectedImage(image)}
                  className="flex items-center gap-4 p-4 hover:bg-[#F9F9F9] cursor-pointer"
                >
                  <div className="w-16 h-16 relative bg-[#F5F1EB] rounded overflow-hidden flex-shrink-0">
                    {image.path.endsWith('.svg') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.path}
                        alt={image.filename}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <Image
                        src={image.thumbnailPath || image.path}
                        alt={image.filename}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#2C2C2C] truncate">{image.filename}</p>
                      {image.isSystemImage && (
                        <span className="px-1.5 py-0.5 bg-[#C4A484]/10 text-[#C4A484] text-[10px] rounded">System</span>
                      )}
                    </div>
                    <p className="text-sm text-[#9CA3AF]">
                      {formatFileSize(image.size)}
                      {image.width && image.height && ` • ${image.width}×${image.height}`}
                    </p>
                    {image.usedIn && image.usedIn.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Used in: {image.usedIn.join(', ')}
                      </p>
                    )}
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
                    {!image.isSystemImage && (
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Image Detail Sidebar */}
      {selectedImage && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-[#E5E5E5] z-40 overflow-hidden">
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
            <div className="p-4 bg-[#F5F1EB]">
              <div className="aspect-video relative bg-white rounded-lg overflow-hidden shadow-inner">
                {selectedImage.path.endsWith('.svg') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedImage.path}
                    alt={selectedImage.filename}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <Image
                    src={selectedImage.path}
                    alt={selectedImage.filename}
                    fill
                    className="object-contain"
                    sizes="384px"
                  />
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedImage.isSystemImage && (
                  <span className="px-2 py-1 bg-[#C4A484]/10 text-[#C4A484] text-xs rounded-full">
                    System Image
                  </span>
                )}
                {selectedImage.usedIn && selectedImage.usedIn.length > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    In Use
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Filename</label>
                <p className="text-sm text-[#2C2C2C] mt-1 break-all">{selectedImage.filename}</p>
              </div>
              
              <div>
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Path</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-[#2C2C2C] break-all flex-1 bg-[#F5F1EB] p-2 rounded">{selectedImage.path}</code>
                  <button
                    onClick={() => copyToClipboard(selectedImage.path)}
                    className="p-1 text-[#6B6B6B] hover:text-[#C4A484] flex-shrink-0"
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
                <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Last Modified</label>
                <p className="text-sm text-[#2C2C2C] mt-1">{formatDate(selectedImage.uploadedAt)}</p>
              </div>

              {/* Usage info */}
              {selectedImage.usedIn && selectedImage.usedIn.length > 0 && (
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Used In</label>
                  <ul className="mt-2 space-y-1">
                    {selectedImage.usedIn.map((usage, i) => (
                      <li key={i} className="text-sm text-[#2C2C2C] flex items-center gap-2">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {usage}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#E5E5E5] space-y-2">
              <button
                onClick={() => {
                  setImageToReplace(selectedImage);
                  replaceInputRef.current?.click();
                }}
                disabled={replacing}
                className="w-full px-4 py-2 text-sm font-medium bg-[#C4A484] text-white hover:bg-[#B8956F] rounded-md transition-colors disabled:opacity-50"
              >
                {replacing ? 'Replacing...' : 'Replace Image'}
              </button>
              
              {!selectedImage.isSystemImage && (
                <button
                  onClick={() => setDeleteConfirm(selectedImage)}
                  className="w-full px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Delete Image
                </button>
              )}

              {selectedImage.isSystemImage && (
                <p className="text-xs text-center text-[#9CA3AF]">
                  System images can be replaced but not deleted
                </p>
              )}
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
