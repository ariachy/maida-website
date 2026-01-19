'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Modal from '@/components/admin/Modal';

interface ImageFile {
  filename: string;
  path: string;
  thumbnailPath: string | null;
  folder: string;
  size: number;
}

interface ImagePickerProps {
  value: string | null;
  onChange: (path: string | null) => void;
  folder?: string;
  label?: string;
}

export default function ImagePicker({
  value,
  onChange,
  folder = 'general',
  label = 'Image',
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load images when modal opens
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/upload');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      onChange(data.file.path);
      setIsOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredImages = images.filter((img) => {
    if (!searchQuery) return true;
    return img.filename.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
        {label}
      </label>

      {value ? (
        <div className="relative inline-block">
          <div className="w-32 h-32 relative bg-[#F5F1EB] rounded-lg overflow-hidden border border-[#D4C4B5]">
            <Image
              src={value}
              alt="Selected image"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="p-1.5 bg-white rounded-full shadow-md text-[#6B6B6B] hover:text-[#C4A484] border border-[#E5E5E5]"
              title="Change image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-1.5 bg-white rounded-full shadow-md text-[#6B6B6B] hover:text-red-500 border border-[#E5E5E5]"
              title="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-[#D4C4B5] rounded-lg text-[#9CA3AF] hover:border-[#C4A484] hover:text-[#C4A484] transition-colors"
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Select Image</span>
        </button>
      )}

      {/* Image Picker Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Image"
        size="xl"
      >
        <div className="space-y-4">
          {/* Upload & Search */}
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#C4A484] hover:bg-[#B8956F] text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
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
                  Upload New
                </>
              )}
            </button>

            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="w-full pl-9 pr-4 py-2 border border-[#D4C4B5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C4A484]"
              />
            </div>
          </div>

          {/* Image Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4A484]" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12 text-[#9CA3AF]">
              {searchQuery ? 'No images match your search' : 'No images uploaded yet'}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
              {filteredImages.map((image) => (
                <button
                  key={image.path}
                  type="button"
                  onClick={() => {
                    onChange(image.path);
                    setIsOpen(false);
                  }}
                  className={`relative aspect-square bg-[#F5F1EB] rounded-lg overflow-hidden border-2 transition-colors ${
                    value === image.path
                      ? 'border-[#C4A484]'
                      : 'border-transparent hover:border-[#D4C4B5]'
                  }`}
                >
                  <Image
                    src={image.thumbnailPath || image.path}
                    alt={image.filename}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {value === image.path && (
                    <div className="absolute inset-0 bg-[#C4A484]/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-[#C4A484] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
