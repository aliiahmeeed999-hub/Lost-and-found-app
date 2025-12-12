/**
 * API Route: POST /api/match/check-lost
 * Checks for matches when a new lost item is added
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkMatchesForLostItem } from '@/lib/matchingAlgorithm';

export async function POST(request: NextRequest) {
  try {
    const { lostItemId } = await request.json();

    // Validate input
    if (!lostItemId) {
      return NextResponse.json(
        { error: 'lostItemId is required' },
        { status: 400 }
      );
    }

    // Check for matches
    const matches = await checkMatchesForLostItem(lostItemId);

    return NextResponse.json(
      {
        success: true,
        message: `Found ${matches.length} potential match(es)`,
        matches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/match/check-lost:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
