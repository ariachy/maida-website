import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// Valid item types
const VALID_TYPES = ['button', 'wifi', 'wifi-card', 'event', 'icon', 'info', 'separator', 'review', 'blog', 'blog-manual'];

// Valid preset colors
const VALID_COLORS = ['terracotta', 'coral', 'olive', 'stone', 'outline', 'cream', 'charcoal', 'white'];

// ===================
// GET /api/admin/meetmeatmaida/items - Get all items
// ===================
export async function GET(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');

    const where = sectionId ? { sectionId } : {};

    const items = await prisma.meetItem.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        section: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// ===================
// POST /api/admin/meetmeatmaida/items - Create new item
// ===================
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sectionId,
      type,
      title,
      titlePt,
      subtitle,
      subtitlePt,
      url,
      icon,
      image,
      color = 'terracotta',
      isActive = true,
      metadata,
    } = body;

    // Validate required fields
    if (!sectionId || typeof sectionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Title not required for separator and blog types
    if (!['separator', 'blog'].includes(type) && (!title || typeof title !== 'string' || title.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Verify section exists
    const section = await prisma.meetSection.findUnique({ where: { id: sectionId } });
    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Validate color (preset or hex)
    const isValidColor = VALID_COLORS.includes(color) || /^#[0-9A-Fa-f]{6}$/.test(color);
    if (!isValidColor) {
      return NextResponse.json(
        { success: false, error: 'Invalid color. Use preset name or hex code.' },
        { status: 400 }
      );
    }

    // Get max order within section
    const maxOrder = await prisma.meetItem.aggregate({
      where: { sectionId },
      _max: { order: true },
    });

    const item = await prisma.meetItem.create({
      data: {
        sectionId,
        type,
        title: title?.trim() || '',
        titlePt: titlePt?.trim() || null,
        subtitle: subtitle?.trim() || null,
        subtitlePt: subtitlePt?.trim() || null,
        url: url?.trim() || null,
        icon: icon?.trim() || null,
        image: image?.trim() || null,
        color,
        isActive,
        order: (maxOrder._max.order ?? -1) + 1,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
      include: {
        section: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

// ===================
// PUT /api/admin/meetmeatmaida/items - Update item
// ===================
export async function PUT(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      sectionId,
      type,
      title,
      titlePt,
      subtitle,
      subtitlePt,
      url,
      icon,
      image,
      color,
      isActive,
      order,
      metadata,
    } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.meetItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (sectionId !== undefined) {
      const section = await prisma.meetSection.findUnique({ where: { id: sectionId } });
      if (!section) {
        return NextResponse.json(
          { success: false, error: 'Section not found' },
          { status: 404 }
        );
      }
      updateData.sectionId = sectionId;
    }

    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json(
          { success: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.type = type;
    }

    if (title !== undefined) {
      updateData.title = title?.trim() || '';
    }

    if (titlePt !== undefined) {
      updateData.titlePt = titlePt?.trim() || null;
    }

    if (subtitle !== undefined) {
      updateData.subtitle = subtitle?.trim() || null;
    }

    if (subtitlePt !== undefined) {
      updateData.subtitlePt = subtitlePt?.trim() || null;
    }

    if (url !== undefined) {
      updateData.url = url?.trim() || null;
    }

    if (icon !== undefined) {
      updateData.icon = icon?.trim() || null;
    }

    if (image !== undefined) {
      updateData.image = image?.trim() || null;
    }

    if (color !== undefined) {
      const isValidColor = VALID_COLORS.includes(color) || /^#[0-9A-Fa-f]{6}$/.test(color);
      if (!isValidColor) {
        return NextResponse.json(
          { success: false, error: 'Invalid color. Use preset name or hex code.' },
          { status: 400 }
        );
      }
      updateData.color = color;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (order !== undefined) {
      updateData.order = Number(order);
    }

    if (metadata !== undefined) {
      updateData.metadata = metadata ? JSON.stringify(metadata) : null;
    }

    const item = await prisma.meetItem.update({
      where: { id },
      data: updateData,
      include: {
        section: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// ===================
// DELETE /api/admin/meetmeatmaida/items - Delete item
// ===================
export async function DELETE(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.meetItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    await prisma.meetItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
