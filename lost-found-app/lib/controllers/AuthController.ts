/**
 * MONOLITHIC APPLICATION LAYER: /controllers
 * 
 * Auth Controller
 * Handles incoming HTTP requests for authentication
 * Validates input, delegates to services, formats responses
 */

import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/AuthService';
import { IUserCreateRequest } from '@/lib/models/User';

export class AuthController {
  /**
   * POST /api/auth/signup
   * Register a new user
   */
  static async signup(request: Request) {
    try {
      const body = await request.json();
      const { name, email, password, phone, studentId } = body;

      // Validate input
      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Name, email, and password are required' },
          { status: 400 }
        );
      }

      // Call auth service
      const result = await AuthService.registerUser({
        name,
        email,
        password,
        phone,
        studentId,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Signup successful',
          user: result,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: error.message || 'Signup failed' },
        { status: 400 }
      );
    }
  }

  /**
   * POST /api/auth/login
   * Login user and set auth token
   */
  static async login(request: Request) {
    try {
      const body = await request.json();
      const { email, password } = body;

      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Call auth service
      const result = await AuthService.loginUser(email, password);

      // Create response
      const response = NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: result.user,
        },
        { status: 200 }
      );

      // Set HTTP-only cookie with token
      response.cookies.set('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: 401 }
      );
    }
  }

  /**
   * POST /api/auth/logout
   * Clear auth token
   */
  static async logout() {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );

    // Clear auth token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}

export default AuthController;
