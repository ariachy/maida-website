import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// ===================
// INPUT SANITIZATION
// ===================
function sanitizeInput(input: string | null | undefined, maxLength: number = 500): string | null {
  if (!input || typeof input !== 'string') return null;
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

// ===================
// URL VALIDATION
// ===================
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Block localhost and internal IPs in production
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ===================
// ICON VALIDATION
// ===================
const ALLOWED_ICONS = ['google', 'tripadvisor', 'thefork', 'star', 'yelp', 'zomato'];

function isValidIcon(icon: string): boolean {
  return ALLOWED_ICONS.includes(icon.toLowerCase());
}

// ===================
// GET /api/admin/review/platforms - Get all platforms (including inactive)
// ===================
export async function GET() {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const platforms = await prisma.reviewPlatform.findMany({
      orderBy: [
        { isPrimary: 'desc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      platforms,
    });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}

// ===================
// POST /api/admin/review/platforms - Create new platform
// ===================
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, url, icon, isActive, isPrimary } = body;

    // Validate and sanitize name
    const sanitizedName = sanitizeInput(name, 100);
    if (!sanitizedName || sanitizedName.length < 1) {
      return NextResponse.json(
        { success: false, error: 'Platform name is required' },
        { status: 400 }
      );
    }

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL. Must be a valid https:// URL.' },
        { status: 400 }
      );
    }

    // Validate icon
    const sanitizedIcon = icon ? icon.toLowerCase().trim() : 'star';
    if (!isValidIcon(sanitizedIcon)) {
      return NextResponse.json(
        { success: false, error: `Invalid icon. Allowed: ${ALLOWED_ICONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate boolean fields
    const isActiveValue = typeof isActive === 'boolean' ? isActive : true;
    const isPrimaryValue = typeof isPrimary === 'boolean' ? isPrimary : false;

    // If setting as primary, unset other primaries
    if (isPrimaryValue) {
      await prisma.reviewPlatform.updateMany({
        where: { isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Get max order
    const maxOrder = await prisma.reviewPlatform.aggregate({
      _max: { order: true },
    });

    const platform = await prisma.reviewPlatform.create({
      data: {
        name: sanitizedName,
        url: trimmedUrl,
        icon: sanitizedIcon,
        isActive: isActiveValue,
        isPrimary: isPrimaryValue,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });

    return NextResponse.json({
      success: true,
      platform,
    });
  } catch (error) {
    console.error('Error creating platform:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create platform' },
      { status: 500 }
    );
  }
}

// ===================
// PUT /api/admin/review/platforms - Update platform
// ===================
export async function PUT(request: NextRequest) {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, url, icon, isActive, isPrimary, order } = body;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Platform ID is required' },
        { status: 400 }
      );
    }

    // Check platform exists
    const existing = await prisma.reviewPlatform.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      );
    }

    // Build update data with validation
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      const sanitizedName = sanitizeInput(name, 100);
      if (!sanitizedName || sanitizedName.length < 1) {
        return NextResponse.json(
          { success: false, error: 'Platform name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = sanitizedName;
    }

    if (url !== undefined) {
      const trimmedUrl = typeof url === 'string' ? url.trim() : '';
      if (!isValidUrl(trimmedUrl)) {
        return NextResponse.json(
          { success: false, error: 'Invalid URL. Must be a valid https:// URL.' },
          { status: 400 }
        );
      }
      updateData.url = trimmedUrl;
    }

    if (icon !== undefined) {
      const sanitizedIcon = typeof icon === 'string' ? icon.toLowerCase().trim() : 'star';
      if (!isValidIcon(sanitizedIcon)) {
        return NextResponse.json(
          { success: false, error: `Invalid icon. Allowed: ${ALLOWED_ICONS.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.icon = sanitizedIcon;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'isActive must be a boolean' },
          { status: 400 }
        );
      }
      updateData.isActive = isActive;
    }

    if (isPrimary !== undefined) {
      if (typeof isPrimary !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'isPrimary must be a boolean' },
          { status: 400 }
        );
      }
      // If setting as primary, unset other primaries
      if (isPrimary) {
        await prisma.reviewPlatform.updateMany({
          where: { 
            isPrimary: true,
            id: { not: id },
          },
          data: { isPrimary: false },
        });
      }
      updateData.isPrimary = isPrimary;
    }

    if (order !== undefined) {
      if (typeof order !== 'number' || !Number.isInteger(order) || order < 0) {
        return NextResponse.json(
          { success: false, error: 'Order must be a non-negative integer' },
          { status: 400 }
        );
      }
      updateData.order = order;
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const platform = await prisma.reviewPlatform.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      platform,
    });
  } catch (error) {
    console.error('Error updating platform:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update platform' },
      { status: 500 }
    );
  }
}

// ===================
// DELETE /api/admin/review/platforms - Delete platform
// ===================
export async function DELETE(request: NextRequest) {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Platform ID is required' },
        { status: 400 }
      );
    }

    // Check platform exists
    const existing = await prisma.reviewPlatform.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Platform not found' },
        { status: 404 }
      );
    }

    await prisma.reviewPlatform.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting platform:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete platform' },
      { status: 500 }
    );
  }
}
