import { NextResponse } from 'next/server';
import { getSessionToken, deleteSession, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const token = await getSessionToken();

    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}