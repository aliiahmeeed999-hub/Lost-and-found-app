/**
 * GET /api/notifications/list
 * Retrieves all notifications for the authenticated user
 * Query params: userId (optional), limit, offset
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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

    if (!decoded || !('userId' in decoded)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || String(decoded.userId));
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify user is requesting their own notifications
    if (userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: cannot access other user notifications' },
        { status: 403 }
      );
    }

    // Fetch notifications
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          link: true,
          isRead: true,
          createdAt: true
        }
      }),
      prisma.notification.count({ where: { userId } })
    ]);

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          notifications,
          pagination: {
            limit,
            offset,
            total,
            unreadCount
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
