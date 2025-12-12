/**
 * API Route: POST /api/match/check-found
 * Checks for matches when a new found item is added
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkMatchesForFoundItem } from '@/lib/matchingAlgorithm';

export async function POST(request: NextRequest) {
  try {
    const { foundItemId } = await request.json();

    // Validate input
    if (!foundItemId) {
      return NextResponse.json(
        { error: 'foundItemId is required' },
        { status: 400 }
      );
    }

    // Check for matches
    const matches = await checkMatchesForFoundItem(foundItemId);

    return NextResponse.json(
      {
        success: true,
        message: `Found ${matches.length} potential match(es)`,
        matches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/match/check-found:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
