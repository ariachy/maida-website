import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// ===================
// PUT /api/admin/meetmeatmaida/reorder - Reorder sections or items
// ===================
export async function PUT(request: NextRequest) {
  try {
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, items } = body;

    if (!type || !['sections', 'items'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Type must be "sections" or "items"' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Validate items format
    for (const item of items) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Each item must have id and order' },
          { status: 400 }
        );
      }
    }

    if (type === 'sections') {
      // Reorder sections
      await prisma.$transaction(
        items.map((item: { id: string; order: number }) =>
          prisma.meetSection.update({
            where: { id: item.id },
            data: { order: item.order },
          })
        )
      );
    } else {
      // Reorder items (may also move between sections)
      await prisma.$transaction(
        items.map((item: { id: string; order: number; sectionId?: string }) =>
          prisma.meetItem.update({
            where: { id: item.id },
            data: {
              order: item.order,
              ...(item.sectionId && { sectionId: item.sectionId }),
            },
          })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder' },
      { status: 500 }
    );
  }
}
