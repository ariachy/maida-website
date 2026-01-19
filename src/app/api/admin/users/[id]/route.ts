import { NextRequest, NextResponse } from 'next/server';
import { validateSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/admin/users/[id] - Delete an admin user
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting primary admin
    if (userToDelete.isPrimary) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete primary admin' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (session.user?.id === id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Delete user (sessions will cascade delete due to schema)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isPrimary: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user (name only, not password)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await validateSession();
    
    if (!session.success) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPrimary: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
