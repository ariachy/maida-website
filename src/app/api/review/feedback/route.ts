import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 10; // Max submissions per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour window

// Helper to get meal period
function getMealPeriod(hour: number): string {
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'dinner';
  return 'late-night';
}

// Helper to get day of week in Portugal timezone
function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Helper to get current time in Portugal timezone
function getPortugalTime(): Date {
  const now = new Date();
  const portugalTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));
  return portugalTime;
}

// POST /api/review/feedback - Submit feedback (public)
export async function POST(request: NextRequest) {
  try {
    // --- Rate Limiting ---
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (record) {
      if (now > record.resetTime) {
        // Window expired, reset
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      } else if (record.count >= MAX_REQUESTS) {
        // Too many requests
        return NextResponse.json(
          { success: false, error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        );
      } else {
        // Increment count
        record.count++;
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }

    // Periodic cleanup (every 100 requests)
    const requestCount = Array.from(rateLimitMap.values()).reduce((sum, r) => sum + r.count, 0);
    if (requestCount % 100 === 0) {
      const cleanupTime = Date.now();
      for (const [mapIp, mapRecord] of Array.from(rateLimitMap.entries())) {
        if (cleanupTime > mapRecord.resetTime) {
          rateLimitMap.delete(mapIp);
        }
      }
    }

    // --- Parse and Validate ---
    const body = await request.json();
    
    const {
      foodRating,
      serviceRating,
      atmosphereRating,
      message,
      name,
      email,
    } = body;

    // Validate required fields
    if (!foodRating || !serviceRating || !atmosphereRating) {
      return NextResponse.json(
        { success: false, error: 'All ratings are required' },
        { status: 400 }
      );
    }

    // Validate rating values (1-5)
    if (
      foodRating < 1 || foodRating > 5 ||
      serviceRating < 1 || serviceRating > 5 ||
      atmosphereRating < 1 || atmosphereRating > 5
    ) {
      return NextResponse.json(
        { success: false, error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      );
    }

    // --- Get Portugal timezone metadata ---
    const portugalTime = getPortugalTime();
    const portugalHour = portugalTime.getHours();
    const dayOfWeek = getDayOfWeek(portugalTime);
    const mealPeriod = getMealPeriod(portugalHour);

    // Get IP and user agent for analytics
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        foodRating,
        serviceRating,
        atmosphereRating,
        message: message || null,
        name: name || null,
        email: email || null,
        dayOfWeek,
        mealPeriod,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        submittedAt: feedback.submittedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET /api/review/feedback - Not allowed publicly
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
