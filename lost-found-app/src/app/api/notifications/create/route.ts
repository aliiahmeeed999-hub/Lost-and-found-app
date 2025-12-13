/**
 * POST /api/notifications/create
 * Creates a new notification for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

interface CreateNotificationBody {
  userId: number;
  type: 'match' | 'found' | 'message' | 'badge' | 'reminder' | 'nearby';
  title: string;
  message: string;
  link?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (admin or system-level operation)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateNotificationBody = await request.json();
    const { userId, type, title, message, link } = body;

    // Validation
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      );
    }

    const validTypes = ['match', 'found', 'message', 'badge', 'reminder', 'nearby'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title: title.trim(),
        message: message.trim(),
        link: link?.trim() || null,
        isRead: false
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification created successfully',
        notification
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
