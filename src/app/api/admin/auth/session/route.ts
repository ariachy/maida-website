import { NextResponse } from 'next/server';
import { validateSession, getSessionCookieOptions } from '@/lib/auth';

export async function GET() {
  try {
    const result = await validateSession();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    if (result.sessionToken) {
      const cookieOptions = getSessionCookieOptions();
      response.cookies.set(cookieOptions.name, result.sessionToken, {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        maxAge: cookieOptions.maxAge,
        path: cookieOptions.path,
      });
    }

    return response;
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred validating session' },
      { status: 500 }
    );
  }
}