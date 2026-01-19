import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Image sizes for optimization
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  large: { width: 1200, height: 1200 },
};

// Define which images are used where (for usage tracking)
const IMAGE_USAGE_MAP: Record<string, string[]> = {
  // Hero images
  '/images/hero/maida-table.webp': ['Homepage Hero'],
  '/images/hero/facade-night.webp': ['Homepage Hero (alt)'],
  '/images/hero/maida-bar.webp': ['Contact Page Hero'],
  '/images/hero/maida-saj-setup.webp': ['SAJ Page Hero'],
  '/images/hero/maida-sign.webp': ['Story Page'],
  
  // Food images
  '/images/food/halloumi.webp': ['Menu - To Start', 'Homepage Menu Highlights'],
  '/images/food/hummus.webp': ['Menu - To Start'],
  '/images/food/muhamara.webp': ['Menu - To Start'],
  '/images/food/tabbouleh.webp': ['Menu - To Start', 'Blog'],
  '/images/food/shawarma.webp': ['Menu - Mains'],
  '/images/food/chicken-breast.webp': ['Menu - Mains'],
  '/images/food/kebab.webp': ['Menu - Mains'],
  '/images/food/shish-barak.webp': ['Menu - Mains'],
  '/images/food/feta-brulee.webp': ['Menu - To Start'],
  '/images/food/gratin.webp': ['Menu - Mains'],
  
  // Drinks images
  '/images/drinks/zhourat-tea.webp': ['Menu - Hot Drinks', 'Coffee & Tea Page'],
  '/images/drinks/coffee-cortado.webp': ['Coffee & Tea Page'],
  '/images/drinks/manhattan.webp': ['Menu - Cocktails'],
  '/images/drinks/bartender.webp': ['Maída Live Page'],
  
  // Atmosphere images
  '/images/atmosphere/dj.webp': ['Maída Live Page'],
  '/images/atmosphere/gathering-table.webp': ['Homepage Story Section'],
  '/images/atmosphere/private-event.webp': ['Maída Live - Private Events'],
  
  // About images
  '/images/about/anna-anthony.webp': ['Story Page - Founders'],
  
  // SAJ images
  '/images/saj/wraps.webp': ['SAJ Page', 'Menu - SAJ Section'],
  '/images/saj/dough-ball.webp': ['SAJ Page'],
  
  // Brand images
  '/images/brand/logo.svg': ['Navbar', 'Footer', 'Favicon'],
  '/images/brand/emblem.svg': ['Page Loader'],
};

/**
 * POST /api/admin/upload
 * Upload and optimize an image
 */
export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';
    const replacePath = formData.get('replacePath') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // If replacing an existing image
    if (replacePath) {
      // Security check
      if (replacePath.includes('..') || (!replacePath.startsWith('/images/') && !replacePath.startsWith('/uploads/'))) {
        return NextResponse.json(
          { success: false, error: 'Invalid replace path' },
          { status: 400 }
        );
      }

      const fullPath = path.join(PUBLIC_DIR, replacePath);
      const ext = path.extname(replacePath).toLowerCase();

      // Process and replace the image
      if (ext === '.webp') {
        await sharp(buffer)
          .webp({ quality: 85 })
          .resize(IMAGE_SIZES.large.width, IMAGE_SIZES.large.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFile(fullPath);
      } else if (ext === '.jpg' || ext === '.jpeg') {
        await sharp(buffer)
          .jpeg({ quality: 85 })
          .resize(IMAGE_SIZES.large.width, IMAGE_SIZES.large.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFile(fullPath);
      } else if (ext === '.png') {
        await sharp(buffer)
          .png({ quality: 85 })
          .resize(IMAGE_SIZES.large.width, IMAGE_SIZES.large.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFile(fullPath);
      } else {
        // For other formats, just write the buffer
        await fs.writeFile(fullPath, buffer);
      }

      // Get updated file info
      const stats = await fs.stat(fullPath);
      let metadata;
      try {
        metadata = await sharp(fullPath).metadata();
      } catch {
        metadata = {};
      }

      return NextResponse.json({
        success: true,
        replaced: true,
        file: {
          filename: path.basename(replacePath),
          path: replacePath,
          size: stats.size,
          width: metadata.width,
          height: metadata.height,
          uploadedAt: new Date().toISOString(),
        },
      });
    }

    // New upload - determine target directory
    const isImagesFolder = folder.startsWith('images/') || ['hero', 'food', 'drinks', 'atmosphere', 'about', 'saj', 'brand', 'catering', '404', 'home'].includes(folder);
    const baseDir = isImagesFolder ? IMAGES_DIR : UPLOAD_DIR;
    const subFolder = isImagesFolder ? folder.replace('images/', '') : folder;
    const uploadPath = path.join(baseDir, subFolder);

    // Create directory if needed
    await fs.mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const ext = 'webp'; // Always convert to WebP for new uploads
    const uniqueId = randomUUID().split('-')[0];
    const originalName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
    const filename = `${originalName}-${uniqueId}.${ext}`;
    const filepath = path.join(uploadPath, filename);

    // Process with Sharp - optimize and convert to WebP
    await sharp(buffer)
      .webp({ quality: 85 })
      .resize(IMAGE_SIZES.large.width, IMAGE_SIZES.large.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(filepath);

    // Generate thumbnail
    const thumbFilename = `${originalName}-${uniqueId}-thumb.${ext}`;
    const thumbPath = path.join(uploadPath, thumbFilename);
    
    await sharp(buffer)
      .webp({ quality: 80 })
      .resize(IMAGE_SIZES.thumbnail.width, IMAGE_SIZES.thumbnail.height, {
        fit: 'cover',
      })
      .toFile(thumbPath);

    // Get file info
    const stats = await fs.stat(filepath);
    const metadata = await sharp(filepath).metadata();

    // Determine the public path
    const publicPath = isImagesFolder 
      ? `/images/${subFolder}/${filename}`
      : `/uploads/${subFolder}/${filename}`;
    const thumbPublicPath = isImagesFolder
      ? `/images/${subFolder}/${thumbFilename}`
      : `/uploads/${subFolder}/${thumbFilename}`;

    // Return success with file info
    return NextResponse.json({
      success: true,
      file: {
        filename,
        originalName: file.name,
        path: publicPath,
        thumbnailPath: thumbPublicPath,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        type: 'image/webp',
        folder: subFolder,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/upload
 * List all images from both /images and /uploads directories
 */
export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all'; // 'all', 'images', 'uploads'

    const images: ImageInfo[] = [];

    // Get images from /images directory
    if (source === 'all' || source === 'images') {
      const imagesFromDir = await getImagesFromDirectory(IMAGES_DIR, '/images');
      images.push(...imagesFromDir);
    }

    // Get images from /uploads directory
    if (source === 'all' || source === 'uploads') {
      try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
      } catch {
        // Directory might already exist
      }
      const uploadsFromDir = await getImagesFromDirectory(UPLOAD_DIR, '/uploads');
      images.push(...uploadsFromDir);
    }

    // Add usage information
    const imagesWithUsage = images.map(img => ({
      ...img,
      usedIn: IMAGE_USAGE_MAP[img.path] || [],
      isSystemImage: img.path.startsWith('/images/'),
    }));

    // Sort: images folder first, then by folder, then by filename
    imagesWithUsage.sort((a, b) => {
      if (a.isSystemImage !== b.isSystemImage) return a.isSystemImage ? -1 : 1;
      if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
      return a.filename.localeCompare(b.filename);
    });

    return NextResponse.json({
      success: true,
      images: imagesWithUsage,
      folders: getUniqueFolders(imagesWithUsage),
    });
  } catch (error) {
    console.error('List images error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list images' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/upload
 * Delete an image (only from /uploads, not /images)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json(
        { success: false, error: 'No path provided' },
        { status: 400 }
      );
    }

    // Security: only allow deleting from /uploads, not /images (system images)
    if (!imagePath.startsWith('/uploads/')) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete system images. Use replace instead.' },
        { status: 400 }
      );
    }

    // Security: prevent path traversal
    if (imagePath.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Build full path
    const fullPath = path.join(PUBLIC_DIR, imagePath);
    
    // Normalize and verify it's within uploads directory
    const normalizedPath = path.normalize(fullPath);
    const normalizedUploadDir = path.normalize(UPLOAD_DIR);
    
    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete main file
    await fs.unlink(fullPath);

    // Try to delete thumbnail if exists
    const ext = path.extname(fullPath);
    const thumbPath = fullPath.replace(ext, `-thumb${ext}`);
    try {
      await fs.access(thumbPath);
      await fs.unlink(thumbPath);
    } catch {
      // Thumbnail might not exist
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

// Helper function to get images from a directory
async function getImagesFromDirectory(baseDir: string, basePath: string): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];

  async function scanDirectory(dir: string, relativePath: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullEntryPath = path.join(dir, entry.name);
        const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          await scanDirectory(fullEntryPath, entryRelativePath);
        } else if (entry.isFile() && !entry.name.includes('-thumb')) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) {
            const stats = await fs.stat(fullEntryPath);
            
            // Try to get dimensions (skip for SVG)
            let width: number | undefined;
            let height: number | undefined;
            if (ext !== '.svg') {
              try {
                const metadata = await sharp(fullEntryPath).metadata();
                width = metadata.width;
                height = metadata.height;
              } catch {
                // Couldn't read metadata
              }
            }

            // Check for thumbnail
            const thumbName = entry.name.replace(/\.[^/.]+$/, '-thumb.webp');
            const thumbFullPath = path.join(dir, thumbName);
            let thumbnailPath: string | null = null;
            try {
              await fs.access(thumbFullPath);
              thumbnailPath = `${basePath}/${entryRelativePath.replace(entry.name, thumbName)}`;
            } catch {
              // No thumbnail
            }

            // Get folder name
            const folder = relativePath || 'root';

            images.push({
              filename: entry.name,
              path: `${basePath}/${entryRelativePath}`,
              thumbnailPath,
              folder,
              size: stats.size,
              width,
              height,
              uploadedAt: stats.mtime.toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error scanning directory:', dir, error);
    }
  }

  try {
    await fs.access(baseDir);
    await scanDirectory(baseDir, '');
  } catch {
    // Directory doesn't exist
  }

  return images;
}

// Helper to get unique folders
function getUniqueFolders(images: ImageInfo[]): string[] {
  const folders = new Set<string>();
  images.forEach(img => folders.add(img.folder));
  return Array.from(folders).sort();
}

interface ImageInfo {
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
