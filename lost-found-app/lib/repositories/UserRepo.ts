/**
 * MONOLITHIC APPLICATION LAYER: /repositories
 * 
 * User Repository
 * Data access layer for User entity - handles all database queries for users
 * No business logic here, only CRUD operations and database interactions
 */

import { prisma } from '@/lib/prisma';
import { IUser, IUserCreateRequest, IUserUpdateRequest } from '@/lib/models/User';

export class UserRepository {
  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    }) as Promise<IUser | null>;
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { id },
    }) as Promise<IUser | null>;
  }

  /**
   * Find user by student ID
   */
  static async findByStudentId(studentId: string): Promise<IUser | null> {
    return prisma.user.findUnique({
      where: { studentId },
    }) as Promise<IUser | null>;
  }

  /**
   * Create new user
   */
  static async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    studentId?: string;
  }): Promise<IUser> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        phone: data.phone,
        studentId: data.studentId,
      },
    }) as Promise<IUser>;
  }

  /**
   * Update user by ID
   */
  static async updateById(id: number, data: IUserUpdateRequest): Promise<IUser> {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        studentId: data.studentId,
        profileImage: data.profileImage,
        bio: data.bio,
      },
    }) as Promise<IUser>;
  }

  /**
   * Increment reputation score
   */
  static async incrementReputation(userId: number, amount: number = 1): Promise<IUser> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        reputation: {
          increment: amount,
        },
      },
    }) as Promise<IUser>;
  }

  /**
   * Verify user email
   */
  static async verifyEmail(userId: number): Promise<IUser> {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    }) as Promise<IUser>;
  }

  /**
   * Delete user
   */
  static async deleteById(id: number): Promise<IUser> {
    return prisma.user.delete({
      where: { id },
    }) as Promise<IUser>;
  }

  /**
   * Get user profile with safe fields (exclude password)
   */
  static async getUserProfile(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        studentId: true,
        profileImage: true,
        bio: true,
        isVerified: true,
        reputation: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export default UserRepository;
