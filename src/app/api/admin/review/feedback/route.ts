import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// Helper to format date in Portugal timezone
function formatPortugalTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Lisbon',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

// GET /api/admin/review/feedback - Get all feedback (admin only)
export async function GET(request: NextRequest) {
  try {
    // Validate admin session (reads from cookies internally)
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const mealPeriod = searchParams.get('mealPeriod');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');

    // Build where clause
    const where: any = {};
    
    if (mealPeriod) {
      where.mealPeriod = mealPeriod;
    }
    
    if (dayOfWeek) {
      where.dayOfWeek = dayOfWeek;
    }

    if (minRating || maxRating) {
      // Filter by average rating
      where.AND = [];
      if (minRating) {
        where.AND.push({
          OR: [
            { foodRating: { gte: parseInt(minRating) } },
            { serviceRating: { gte: parseInt(minRating) } },
            { atmosphereRating: { gte: parseInt(minRating) } },
          ],
        });
      }
    }

    // Get total count
    const total = await prisma.feedback.count({ where });

    // Get feedback with pagination
    const feedback = await prisma.feedback.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform feedback to include Portugal timezone formatted times
    const feedbackWithPortugalTime = feedback.map((item) => ({
      ...item,
      // Original UTC time (for sorting/filtering)
      submittedAt: item.submittedAt,
      // Portugal timezone formatted for display
      submittedAtPortugal: formatPortugalTime(item.submittedAt),
      // Average rating for convenience
      averageRating: ((item.foodRating + item.serviceRating + item.atmosphereRating) / 3).toFixed(1),
    }));

    return NextResponse.json({
      success: true,
      feedback: feedbackWithPortugalTime,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/review/feedback?id=xxx - Delete feedback (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin session (reads from cookies internally)
    const session = await validateSession();
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Feedback ID required' },
        { status: 400 }
      );
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted',
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
