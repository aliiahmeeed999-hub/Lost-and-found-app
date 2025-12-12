import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface UpdateProfileBody {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  studentId?: string | null;
}

interface UpdateData {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  studentId?: string | null;
}

/**
 * PUT /api/user/update
 * Update the authenticated user's profile information
 */
export async function PUT(request: NextRequest) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token) as { userId: number; email: string } | null;

    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: UpdateProfileBody = await request.json();

    // ========================================
    // VALIDATION
    // ========================================

    const updateData: UpdateData = {};

    // Validate and add name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Name must be at least 2 characters long' },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    // Validate and add phone if provided
    if (body.phone !== undefined) {
      if (body.phone && typeof body.phone === 'string') {
        // Basic phone validation - allow empty or valid format
        if (!/^[0-9+\-().\s]*$/.test(body.phone)) {
          return NextResponse.json(
            { error: 'Invalid phone number format' },
            { status: 400 }
          );
        }
        updateData.phone = body.phone.trim() || null;
      } else if (body.phone === null || body.phone === '') {
        updateData.phone = null;
      }
    }

    // Validate and add bio if provided
    if (body.bio !== undefined) {
      if (body.bio && typeof body.bio === 'string') {
        if (body.bio.length > 500) {
          return NextResponse.json(
            { error: 'Bio must be 500 characters or less' },
            { status: 400 }
          );
        }
        updateData.bio = body.bio.trim() || null;
      } else if (body.bio === null || body.bio === '') {
        updateData.bio = null;
      }
    }

    // Validate and add profile image if provided
    if (body.profileImage !== undefined) {
      if (body.profileImage && typeof body.profileImage === 'string') {
        // Basic URL validation
        try {
          new URL(body.profileImage);
          updateData.profileImage = body.profileImage;
        } catch {
          return NextResponse.json(
            { error: 'Invalid profile image URL' },
            { status: 400 }
          );
        }
      } else if (body.profileImage === null || body.profileImage === '') {
        updateData.profileImage = null;
      }
    }

    // Validate and add student ID if provided
    if (body.studentId !== undefined) {
      if (body.studentId && typeof body.studentId === 'string') {
        if (body.studentId.length < 2) {
          return NextResponse.json(
            { error: 'Student ID must be at least 2 characters' },
            { status: 400 }
          );
        }
        updateData.studentId = body.studentId.trim() || null;
      } else if (body.studentId === null || body.studentId === '') {
        updateData.studentId = null;
      }
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided to update' },
        { status: 400 }
      );
    }

    // ========================================
    // UPDATE USER
    // ========================================

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        studentId: true,
        profileImage: true,
        bio: true,
        isVerified: true,
        reputation: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { error: 'Student ID already in use' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
