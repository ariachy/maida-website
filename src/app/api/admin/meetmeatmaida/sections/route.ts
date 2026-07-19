import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// ===================
// GET /api/admin/meetmeatmaida/sections - Get all sections (including inactive)
// ===================
export async function GET() {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sections = await prisma.meetSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// ===================
// POST /api/admin/meetmeatmaida/sections - Create new section
// ===================
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, titlePt, isActive = true } = body;

    // Get max order
    const maxOrder = await prisma.meetSection.aggregate({
      _max: { order: true },
    });

    const section = await prisma.meetSection.create({
      data: {
        title: title?.trim() || '',
        titlePt: titlePt?.trim() || null,
        isActive,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// ===================
// PUT /api/admin/meetmeatmaida/sections - Update section
// ===================
export async function PUT(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, titlePt, isActive, order } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.meetSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) {
      updateData.title = title?.trim() || '';
    }

    if (titlePt !== undefined) {
      updateData.titlePt = titlePt?.trim() || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (order !== undefined) {
      updateData.order = Number(order);
    }

    const section = await prisma.meetSection.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// ===================
// DELETE /api/admin/meetmeatmaida/sections - Delete section
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
        { success: false, error: 'Section ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.meetSection.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Delete section (items will be cascade deleted)
    await prisma.meetSection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
