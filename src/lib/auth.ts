import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Constants
const SESSION_COOKIE_NAME = 'maida_admin_session';
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const BCRYPT_ROUNDS = 12;

// Types
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  isPrimary: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: SessionUser;
  error?: string;
  sessionToken?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { userId, token, expiresAt, ipAddress, userAgent },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });

  return token;
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  };
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

export async function validateSession(): Promise<AuthResult> {
  const token = await getSessionToken();

  if (!token) {
    return { success: false, error: 'No session found' };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return { success: false, error: 'Invalid session' };
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return { success: false, error: 'Session expired' };
  }

  const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.session.update({
    where: { id: session.id },
    data: { expiresAt: newExpiresAt },
  });

  return {
    success: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      isPrimary: session.user.isPrimary,
    },
    sessionToken: token,
  };
}

export async function authenticateUser(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = await createSession(user.id, ipAddress, userAgent);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isPrimary: user.isPrimary,
    },
    sessionToken: token,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}

export { SESSION_COOKIE_NAME };