import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Image sizes for optimization
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  large: { width: 1200, height: 1200 },
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

    // Create upload directory if needed
    const uploadPath = path.join(UPLOAD_DIR, folder);
    await fs.mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const ext = 'webp'; // Always convert to WebP
    const uniqueId = randomUUID().split('-')[0];
    const originalName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
    const filename = `${originalName}-${uniqueId}.${ext}`;
    const filepath = path.join(uploadPath, filename);

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

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

    // Return success with file info
    return NextResponse.json({
      success: true,
      file: {
        filename,
        originalName: file.name,
        path: `/uploads/${folder}/${filename}`,
        thumbnailPath: `/uploads/${folder}/${thumbFilename}`,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        type: 'image/webp',
        folder,
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
 * List uploaded images
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
    const folder = searchParams.get('folder') || '';

    // Ensure upload directory exists
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Get all images
    const images = await getImagesRecursive(UPLOAD_DIR, folder);

    return NextResponse.json({
      success: true,
      images,
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
 * Delete an image
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

    // Security: ensure path starts with /uploads/ and doesn't have path traversal
    if (!imagePath.startsWith('/uploads/') || imagePath.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Build full path
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    
    // Normalize and verify it's within uploads directory
    const normalizedPath = path.normalize(fullPath);
    const normalizedUploadDir = path.normalize(UPLOAD_DIR);
    
    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      console.error('Path security check failed:', { normalizedPath, normalizedUploadDir });
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch (accessError) {
      console.error('File not found:', fullPath, accessError);
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete main file
    await fs.unlink(fullPath);
    console.log('Deleted file:', fullPath);

    // Try to delete thumbnail if exists
    const thumbPath = fullPath.replace(/\.webp$/, '-thumb.webp');
    try {
      await fs.access(thumbPath);
      await fs.unlink(thumbPath);
      console.log('Deleted thumbnail:', thumbPath);
    } catch {
      // Thumbnail might not exist, that's ok
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

// Helper function to get images recursively
async function getImagesRecursive(baseDir: string, subDir: string = ''): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  const currentDir = subDir ? path.join(baseDir, subDir) : baseDir;

  try {
    await fs.access(currentDir);
  } catch {
    // Directory doesn't exist yet
    return images;
  }

  try {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = subDir ? `${subDir}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        // Recursively get images from subdirectory
        const subImages = await getImagesRecursive(baseDir, entryPath);
        images.push(...subImages);
      } else if (entry.isFile() && !entry.name.includes('-thumb')) {
        // Only include non-thumbnail images
        const ext = path.extname(entry.name).toLowerCase();
        if (['.webp', '.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
          const fullPath = path.join(currentDir, entry.name);
          const stats = await fs.stat(fullPath);
          
          // Try to get image dimensions
          let width: number | undefined;
          let height: number | undefined;
          try {
            const metadata = await sharp(fullPath).metadata();
            width = metadata.width;
            height = metadata.height;
          } catch {
            // Couldn't read metadata
          }

          // Check for thumbnail
          const thumbName = entry.name.replace(/\.[^/.]+$/, '-thumb.webp');
          const thumbFullPath = path.join(currentDir, thumbName);
          let hasThumbnail = false;
          try {
            await fs.access(thumbFullPath);
            hasThumbnail = true;
          } catch {
            // No thumbnail
          }

          images.push({
            filename: entry.name,
            path: `/uploads/${entryPath}`,
            thumbnailPath: hasThumbnail ? `/uploads/${entryPath.replace(/\.[^/.]+$/, '-thumb.webp')}` : null,
            folder: subDir || 'root',
            size: stats.size,
            width,
            height,
            uploadedAt: stats.mtime.toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', currentDir, error);
  }

  return images;
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
}
