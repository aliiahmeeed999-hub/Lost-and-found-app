import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not set in environment variables!');
}

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT TOKEN MANAGEMENT
// ============================================

/**
 * Generate JWT token for a user
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @returns {string} JWT token
 */
export function generateToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

// ============================================
// REQUEST HELPERS
// ============================================

/**
 * Get user from request cookies (Server Component)
 * @returns {Promise<object|null>} User data or null
 */
export async function getUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Require authentication (throw error if not authenticated)
 * @returns {Promise<object>} User data
 * @throws {Error} If not authenticated
 */
export async function requireAuth() {
  const user = await getUserFromCookies();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
