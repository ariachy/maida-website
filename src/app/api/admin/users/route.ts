import { NextRequest, NextResponse } from 'next/server';
import { validateSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users - List all admin users
export async function GET() {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isPrimary: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: [
        { isPrimary: 'desc' }, // Primary admin first
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, name, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        passwordHash,
        isPrimary: false, // New users are never primary
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPrimary: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Password validation helper
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
