/**
 * MONOLITHIC APPLICATION LAYER: /services
 * 
 * Authentication Service
 * Contains all business logic for user authentication and authorization
 * Coordinates between controllers and repositories
 */

import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';
import { isValidEmail } from '@/lib/auth';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { IUserCreateRequest } from '@/lib/models/User';
import { MESSAGES, VALIDATION } from '@/lib/config/constants';

export class AuthService {
  /**
   * Register a new user
   * Business logic: validation, hashing, duplicate checking
   */
  static async registerUser(data: IUserCreateRequest) {
    // Validate email format
    if (!isValidEmail(data.email)) {
      throw new Error(MESSAGES.AUTH_INVALID_EMAIL_FORMAT);
    }

    // Validate password strength
    if (data.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      throw new Error(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
    }

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(MESSAGES.AUTH_EMAIL_ALREADY_EXISTS);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user in repository
    const user = await UserRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      studentId: data.studentId,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      reputation: user.reputation,
    };
  }

  /**
   * Login user
   * Business logic: finding user, password verification, token generation
   */
  static async loginUser(email: string, password: string) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!isValidEmail(email)) {
      throw new Error(MESSAGES.AUTH_INVALID_EMAIL_FORMAT);
    }

    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.AUTH_INVALID_EMAIL_PASSWORD);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error(MESSAGES.AUTH_INVALID_EMAIL_PASSWORD);
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        reputation: user.reputation,
        isVerified: user.isVerified,
      },
    };
  }

  /**
   * Verify if a user exists by email
   */
  static async userExists(email: string): Promise<boolean> {
    const user = await UserRepository.findByEmail(email);
    return !!user;
  }

  /**
   * Get user by ID (for token verification)
   */
  static async getUserById(userId: number) {
    const user = await UserRepository.getUserProfile(userId);
    if (!user) {
      throw new Error(MESSAGES.AUTH_USER_NOT_FOUND);
    }
    return user;
  }
}

export default AuthService;
