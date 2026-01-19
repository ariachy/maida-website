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
};

// Ensure uploads directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * POST /api/admin/upload
 * Upload a new image or replace an existing one
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

    // Ensure uploads directory exists
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
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
        { success: false, error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum: 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // If replacing an existing image
    if (replacePath) {
      // Security: prevent path traversal
      if (replacePath.includes('..')) {
        return NextResponse.json(
          { success: false, error: 'Invalid path' },
          { status: 400 }
        );
      }

      const targetPath = path.join(PUBLIC_DIR, replacePath);

      // Optimize and save
      await sharp(buffer)
        .resize(IMAGE_SIZES.large.width, IMAGE_SIZES.large.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(targetPath);

      return NextResponse.json({
        success: true,
        path: replacePath,
        message: 'Image replaced successfully',
      });
    }

    // New upload
    const targetFolder = folder || 'general';
    const folderPath = path.join(UPLOAD_DIR, targetFolder);

    // Create folder if it doesn't exist
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }

    // Generate unique filename
    const ext = '.webp'; // Always save as WebP
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(folderPath, filename);
    const thumbPath = path.join(folderPath, `${randomUUID()}-thumb${ext}`);

    // Optimize and save main image
    await sharp(buffer)
      .resize(IMAGE_SIZES.large.width, IMAGE_SIZES.large.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(filePath);

    // Create thumbnail
    await sharp(buffer)
      .resize(IMAGE_SIZES.thumbnail.width, IMAGE_SIZES.thumbnail.height, {
        fit: 'cover',
      })
      .webp({ quality: 70 })
      .toFile(thumbPath);

    // Return the web path
    const webPath = `/uploads/${targetFolder}/${filename}`;

    return NextResponse.json({
      success: true,
      path: webPath,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Helper to get unique folders from images
function getUniqueFolders(images: ImageInfo[]): string[] {
  const folders = new Set<string>();
  images.forEach((img) => {
    if (img.folder) folders.add(img.folder);
  });
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
  isSystemImage: boolean;
}

/**
 * GET /api/admin/upload
 * List all images (both system images from /images and uploaded from /uploads)
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

    // Ensure uploads directory exists
    await ensureUploadDir();

    const images: ImageInfo[] = [];

    // Get system images from /images
    const systemImages = await getImagesFromDirectory(IMAGES_DIR, '/images');
    systemImages.forEach((img) => {
      img.isSystemImage = true;
      img.usedIn = IMAGE_USAGE_MAP[img.path] || [];
    });
    images.push(...systemImages);

    // Get uploaded images from /uploads
    const uploadedImages = await getImagesFromDirectory(UPLOAD_DIR, '/uploads');
    uploadedImages.forEach((img) => {
      img.isSystemImage = false;
    });
    images.push(...uploadedImages);

    // Add usage info to images
    const imagesWithUsage = images.map((img) => ({
      ...img,
      usedIn: IMAGE_USAGE_MAP[img.path] || img.usedIn || [],
    }));

    // Sort: system images first (by folder), then uploads
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
        { 
          success: false, 
          error: 'Cannot delete system images from /images folder. Use "Replace Image" instead to update them.' 
        },
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
        { success: false, error: 'Invalid path - must be within uploads directory' },
        { status: 400 }
      );
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: `File not found: ${imagePath}` },
        { status: 404 }
      );
    }

    // Helper function to delete with retry (handles Windows file locking)
    const deleteWithRetry = async (filePath: string, maxRetries = 3): Promise<void> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await fs.unlink(filePath);
          return; // Success
        } catch (err: any) {
          if (err.code === 'EBUSY' && attempt < maxRetries) {
            // Wait a bit and retry (file might be locked by image optimization)
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            continue;
          }
          throw err;
        }
      }
    };

    // Delete main file
    try {
      await deleteWithRetry(fullPath);
    } catch (err: any) {
      if (err.code === 'EBUSY') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'File is currently in use. Please close any image previews and try again, or restart the dev server.' 
          },
          { status: 409 }
        );
      }
      throw err;
    }

    // Try to delete thumbnail if exists
    const ext = path.extname(fullPath);
    const thumbPath = fullPath.replace(ext, `-thumb${ext}`);
    try {
      await fs.access(thumbPath);
      await deleteWithRetry(thumbPath);
    } catch {
      // Thumbnail might not exist or is locked, that's okay
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Helper function to get images from a directory
async function getImagesFromDirectory(
  baseDir: string,
  basePath: string
): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];

  async function scanDirectory(dir: string, relativePath: string) {
    try {
      await fs.access(dir);
    } catch {
      // Directory doesn't exist, return empty
      return;
    }

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullEntryPath = path.join(dir, entry.name);
        const entryRelativePath = relativePath
          ? `${relativePath}/${entry.name}`
          : entry.name;

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
            const thumbName = entry.name.replace(
              /\.[^/.]+$/,
              `-thumb${ext}`
            );
            const thumbFullPath = path.join(dir, thumbName);
            let thumbnailPath: string | null = null;
            try {
              await fs.access(thumbFullPath);
              thumbnailPath = `${basePath}/${entryRelativePath.replace(entry.name, thumbName)}`;
            } catch {
              // No thumbnail
            }

            // Determine folder from path
            const pathParts = entryRelativePath.split('/');
            const folder = pathParts.length > 1 ? pathParts[0] : 'root';

            images.push({
              filename: entry.name,
              path: `${basePath}/${entryRelativePath}`,
              thumbnailPath,
              folder,
              size: stats.size,
              width,
              height,
              uploadedAt: stats.mtime.toISOString(),
              isSystemImage: basePath === '/images',
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  await scanDirectory(baseDir, '');
  return images;
}
