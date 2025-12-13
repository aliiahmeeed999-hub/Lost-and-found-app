/**
 * MONOLITHIC APPLICATION LAYER: /controllers
 * 
 * Match Controller
 * Handles incoming HTTP requests for item matching
 * Validates input, delegates to services, formats responses
 */

import { NextResponse } from 'next/server';
import { MatchService } from '@/lib/services/MatchService';
import { getUserFromCookies } from '@/lib/auth';

export class MatchController {
  /**
   * GET /api/match/list
   * Get all matches with pagination
   */
  static async getAll(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const result = await MatchService.getAllMatches({
        status: status || undefined,
        page,
        limit,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
      console.error('Get matches error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch matches' },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/match/check-lost/:lostItemId
   * Get matches for a lost item
   */
  static async getMatchesForLostItem(lostItemId: number) {
    try {
      const matches = await MatchService.getMatchesForLostItem(lostItemId);

      return NextResponse.json(
        {
          success: true,
          matches,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Get lost item matches error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch matches' },
        { status: 404 }
      );
    }
  }

  /**
   * GET /api/match/check-found/:foundItemId
   * Get matches for a found item
   */
  static async getMatchesForFoundItem(foundItemId: number) {
    try {
      const matches = await MatchService.getMatchesForFoundItem(foundItemId);

      return NextResponse.json(
        {
          success: true,
          matches,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Get found item matches error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch matches' },
        { status: 404 }
      );
    }
  }

  /**
   * POST /api/match/confirm/:matchId
   * Confirm a match
   */
  static async confirmMatch(request: Request, matchId: number) {
    try {
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const match = await MatchService.confirmMatch(matchId, user.userId);

      return NextResponse.json(
        {
          success: true,
          message: 'Match confirmed',
          match,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Confirm match error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to confirm match' },
        { status: error.message.includes('permission') ? 403 : 400 }
      );
    }
  }

  /**
   * POST /api/match/:matchId/reject
   * Reject a match
   */
  static async rejectMatch(request: Request, matchId: number) {
    try {
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const match = await MatchService.rejectMatch(matchId, user.userId);

      return NextResponse.json(
        {
          success: true,
          message: 'Match rejected',
          match,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Reject match error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to reject match' },
        { status: error.message.includes('permission') ? 403 : 400 }
      );
    }
  }
}

export default MatchController;
