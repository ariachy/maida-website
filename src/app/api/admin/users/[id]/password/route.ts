import { NextRequest, NextResponse } from 'next/server';
import { validateSession, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/users/[id]/password - Change user password
export async function PUT(
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
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine if changing own password or another user's
    const isOwnPassword = session.user.id === id;

    // If changing own password, require current password
    if (isOwnPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required' },
          { status: 400 }
        );
      }

      const isCurrentValid = await verifyPassword(currentPassword, targetUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    } else {
      // Only primary admin can change other users' passwords
      if (!session.user.isPrimary) {
        return NextResponse.json(
          { success: false, error: 'Only primary admin can change other users\' passwords' },
          { status: 403 }
        );
      }
    }

    // Validate new password
    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Hash and update password
    const passwordHash = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Invalidate all sessions for the user whose password was changed (except current if own)
    if (isOwnPassword) {
      // Delete other sessions, keep current
      await prisma.session.deleteMany({
        where: {
          userId: id,
          token: { not: session.sessionToken || '' },
        },
      });
    } else {
      // Delete all sessions for that user
      await prisma.session.deleteMany({
        where: { userId: id },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
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
