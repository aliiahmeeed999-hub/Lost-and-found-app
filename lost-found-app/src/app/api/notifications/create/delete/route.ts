/**
 * API Route: POST /api/notifications/delete
 * Deletes one or multiple notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !('userId' in decoded)) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let { notificationId, notificationIds } = body;

    // Support both single and multiple IDs
    if (!notificationId && !notificationIds) {
      return NextResponse.json(
        { error: 'notificationId or notificationIds is required' },
        { status: 400 }
      );
    }

    const ids = notificationIds 
      ? (Array.isArray(notificationIds) ? notificationIds : [notificationIds]) 
      : [notificationId];

    // Verify all notifications belong to the user
    const notifications = await prisma.notification.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true }
    });

    const unauthorizedIds = notifications.filter((n: { id: number; userId: number }) => n.userId !== decoded.userId);
    if (unauthorizedIds.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized: cannot delete other user notifications' },
        { status: 403 }
      );
    }

    // Delete notifications
    const deleted = await prisma.notification.deleteMany({
      where: { id: { in: ids } }
    });

    return NextResponse.json(
      {
        success: true,
        message: `${deleted.count} notification(s) deleted`,
        count: deleted.count
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/notifications/delete:', error);

    return NextResponse.json(
      { 
        error: 'Failed to delete notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
