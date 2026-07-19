export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ===================
// GET /api/review/platforms - Get active platforms (public)
// ===================
export async function GET() {
  try {
    const platforms = await prisma.reviewPlatform.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        url: true,
        icon: true,
        isPrimary: true,
        isActive: true,
      },
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
