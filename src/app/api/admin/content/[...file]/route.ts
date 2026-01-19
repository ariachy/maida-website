import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

// Allowed files that can be edited
const ALLOWED_FILES = [
  'locales/en.json',
  'locales/pt.json',
  'menu.json',
];

// Base path for data files
const DATA_DIR = path.join(process.cwd(), 'src', 'data');

/**
 * GET /api/admin/content/[...file]
 * Read a JSON file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { file: string[] } }
) {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get file path from params
    const filePath = params.file.join('/');
    
    // Validate file is allowed
    if (!ALLOWED_FILES.includes(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not allowed' },
        { status: 403 }
      );
    }

    // Read file
    const fullPath = path.join(DATA_DIR, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const data = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data,
      file: filePath,
    });
  } catch (error) {
    console.error('Content read error:', error);
    
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/content/[...file]
 * Update a JSON file
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { file: string[] } }
) {
  try {
    // Validate session
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get file path from params
    const filePath = params.file.join('/');
    
    // Validate file is allowed
    if (!ALLOWED_FILES.includes(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File not allowed' },
        { status: 403 }
      );
    }

    // Get new content from request body
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'No data provided' },
        { status: 400 }
      );
    }

    // Validate JSON structure
    try {
      JSON.stringify(data);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON data' },
        { status: 400 }
      );
    }

    // Create backup before writing
    const fullPath = path.join(DATA_DIR, filePath);
    const backupDir = path.join(DATA_DIR, '.backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${filePath.replace('/', '_')}.${timestamp}.json`);

    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });
      
      // Read current content and save backup
      const currentContent = await fs.readFile(fullPath, 'utf-8');
      await fs.writeFile(backupPath, currentContent, 'utf-8');
    } catch (backupError) {
      console.warn('Backup failed:', backupError);
      // Continue anyway - backup is nice to have but not critical
    }

    // Write new content with pretty formatting
    const newContent = JSON.stringify(data, null, 2);
    await fs.writeFile(fullPath, newContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'File updated successfully',
      file: filePath,
    });
  } catch (error) {
    console.error('Content write error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to write file' },
      { status: 500 }
    );
  }
}
