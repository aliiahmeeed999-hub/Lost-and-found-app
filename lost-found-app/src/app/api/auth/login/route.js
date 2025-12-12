import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, isValidEmail } from '@/lib/auth';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // ========================================
    // VALIDATION
    // ========================================
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ========================================
    // FIND USER
    // ========================================
    
    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase().trim() 
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        profileImage: true,
        reputation: true,
        isVerified: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ========================================
    // VERIFY PASSWORD
    // ========================================
    
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ========================================
    // GENERATE TOKEN
    // ========================================
    
    const token = generateToken(user.id, user.email);

    // ========================================
    // CREATE RESPONSE
    // ========================================
    
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        reputation: user.reputation,
        isVerified: user.isVerified
      }
    }, { status: 200 });

    // Set HTTP-only cookie with token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
