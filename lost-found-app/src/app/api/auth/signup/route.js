import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, isValidEmail, validatePassword } from '@/lib/auth.js';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password } = body;

    // ========================================
    // VALIDATION
    // ========================================
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // ========================================
    // CHECK EXISTING USER
    // ========================================
    
    const existingUser = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase().trim() 
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // ========================================
    // CREATE USER
    // ========================================
    
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        reputation: true,
        isVerified: true,
        createdAt: true
      }
    });

    // ========================================
    // GENERATE TOKEN
    // ========================================
    
    const token = generateToken(user.id, user.email);

    // ========================================
    // CREATE RESPONSE
    // ========================================
    
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        reputation: user.reputation,
        isVerified: user.isVerified
      }
    }, { status: 201 });

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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
