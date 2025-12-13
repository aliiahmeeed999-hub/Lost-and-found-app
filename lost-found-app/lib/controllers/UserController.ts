/**
 * MONOLITHIC APPLICATION LAYER: /controllers
 * 
 * User Controller
 * Handles incoming HTTP requests for user profiles
 * Validates input, delegates to services, formats responses
 */

import { NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';
import { getUserFromCookies } from '@/lib/auth';
import { IUserUpdateRequest } from '@/lib/models/User';

export class UserController {
  /**
   * GET /api/user/profile
   * Get authenticated user's profile
   */
  static async getProfile() {
    try {
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const profile = await UserService.getUserProfile(user.userId);

      return NextResponse.json(
        {
          success: true,
          profile,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Get profile error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch profile' },
        { status: 500 }
      );
    }
  }

  /**
   * PUT /api/user/profile
   * Update authenticated user's profile
   */
  static async updateProfile(request: Request) {
    try {
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const body = await request.json();

      const updatedProfile = await UserService.updateUserProfile(user.userId, body);

      return NextResponse.json(
        {
          success: true,
          message: 'Profile updated successfully',
          profile: updatedProfile,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Update profile error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update profile' },
        { status: 400 }
      );
    }
  }

  /**
   * GET /api/user/:userId
   * Get public user profile
   */
  static async getPublicProfile(userId: number) {
    try {
      const profile = await UserService.getUserProfile(userId);

      return NextResponse.json(
        {
          success: true,
          profile,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Get public profile error:', error);
      return NextResponse.json(
        { error: error.message || 'User not found' },
        { status: 404 }
      );
    }
  }

  /**
   * GET /api/user/stats
   * Get user statistics
   */
  static async getStats() {
    try {
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const stats = await UserService.getUserStats(user.userId);

      return NextResponse.json(
        {
          success: true,
          stats,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Get stats error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch stats' },
        { status: 500 }
      );
    }
  }

  /**
   * PUT /api/user/profile-image
   * Update user profile image
   */
  static async updateProfileImage(request: Request) {
    try {
      const user = await getUserFromCookies();
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const { imageUrl } = body;

      if (!imageUrl) {
        return NextResponse.json(
          { error: 'Image URL is required' },
          { status: 400 }
        );
      }

      const result = await UserService.updateProfileImage(user.userId, imageUrl);

      return NextResponse.json(
        {
          success: true,
          message: 'Profile image updated',
          result,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Update profile image error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update profile image' },
        { status: 400 }
      );
    }
  }
}

export default UserController;
