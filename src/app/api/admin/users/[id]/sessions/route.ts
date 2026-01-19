import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/admin/users/[id]/sessions - Invalidate all sessions except current
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await validateSession();
    
    if (!session.success || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Can only invalidate own sessions (unless primary admin)
    if (session.user.id !== id && !session.user.isPrimary) {
      return NextResponse.json(
        { success: false, error: 'Cannot invalidate other users\' sessions' },
        { status: 403 }
      );
    }

    // Delete all sessions except current one
    const result = await prisma.session.deleteMany({
      where: {
        userId: id,
        token: { not: session.sessionToken || '' },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Logged out ${result.count} other session(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error invalidating sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to invalidate sessions' },
      { status: 500 }
    );
  }
}
