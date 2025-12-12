/**
 * API Route: POST /api/match/confirm
 * Confirms a match (updates status to 'confirmed')
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

    const { matchId, notes } = await request.json();

    // Validate input
    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    // Get the match to verify ownership
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        lostItem: true,
        foundItem: true,
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Verify that the user owns one of the items in the match
    const userId = decoded.userId as number;
    const isLostItemOwner = match.lostItem.userId === userId;
    const isFoundItemOwner = match.foundItem.userId === userId;

    if (!isLostItemOwner && !isFoundItemOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Confirm the match
    const confirmedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'confirmed',
        notes: notes || null,
      },
      include: {
        lostItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Match confirmed successfully',
        match: confirmedMatch,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/match/confirm:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
