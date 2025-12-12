/**
 * API Route: GET /api/match/list
 * Gets all matches for the logged-in user
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const userId = decoded.userId as number;

    // Get all matches for the user (both as lost item owner and found item owner)
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          {
            lostItem: {
              userId,
            },
          },
          {
            foundItem: {
              userId,
            },
          },
        ],
      },
      include: {
        lostItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        foundItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        matchScore: 'desc',
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: matches.length,
        matches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/match/list:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
