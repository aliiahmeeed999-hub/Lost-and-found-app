/**
 * MONOLITHIC APPLICATION LAYER: /repositories
 * 
 * Match Repository
 * Data access layer for Match entity - handles all database queries for matches
 * No business logic here, only CRUD operations and database interactions
 */

import { prisma } from '@/lib/prisma';
import { IMatch } from '@/lib/models/Match';

export class MatchRepository {
  /**
   * Find match by ID
   */
  static async findById(id: number) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        lostItem: true,
        foundItem: true,
      },
    });
  }

  /**
   * Find match by lost and found item IDs
   */
  static async findByItemIds(lostItemId: number, foundItemId: number) {
    return prisma.match.findUnique({
      where: {
        lostItemId_foundItemId: {
          lostItemId,
          foundItemId,
        },
      },
      include: {
        lostItem: true,
        foundItem: true,
      },
    });
  }

  /**
   * Find all matches with filters
   */
  static async findAll(filters: {
    status?: string;
    lostItemId?: number;
    foundItemId?: number;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.lostItemId) where.lostItemId = filters.lostItemId;
    if (filters.foundItemId) where.foundItemId = filters.foundItemId;

    return prisma.match.findMany({
      where,
      include: {
        lostItem: true,
        foundItem: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: filters.skip || 0,
      take: filters.take || 10,
    });
  }

  /**
   * Find matches for a specific lost item
   */
  static async findMatchesForLostItem(lostItemId: number, status?: string) {
    return prisma.match.findMany({
      where: {
        lostItemId,
        ...(status && { status }),
      },
      include: {
        foundItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                reputation: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { matchScore: 'desc' },
    });
  }

  /**
   * Find matches for a specific found item
   */
  static async findMatchesForFoundItem(foundItemId: number, status?: string) {
    return prisma.match.findMany({
      where: {
        foundItemId,
        ...(status && { status }),
      },
      include: {
        lostItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                reputation: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { matchScore: 'desc' },
    });
  }

  /**
   * Create new match
   */
  static async create(data: {
    lostItemId: number;
    foundItemId: number;
    matchScore: number;
    notes?: string;
  }) {
    return prisma.match.create({
      data: {
        lostItemId: data.lostItemId,
        foundItemId: data.foundItemId,
        matchScore: data.matchScore,
        notes: data.notes,
      },
      include: {
        lostItem: true,
        foundItem: true,
      },
    });
  }

  /**
   * Update match by ID
   */
  static async updateById(id: number, data: { status?: string; notes?: string }) {
    return prisma.match.update({
      where: { id },
      data: {
        status: data.status,
        notes: data.notes,
      },
      include: {
        lostItem: true,
        foundItem: true,
      },
    });
  }

  /**
   * Delete match by ID
   */
  static async deleteById(id: number) {
    return prisma.match.delete({
      where: { id },
    });
  }

  /**
   * Count matches with filters
   */
  static async countMatches(filters: {
    status?: string;
    lostItemId?: number;
    foundItemId?: number;
  }) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.lostItemId) where.lostItemId = filters.lostItemId;
    if (filters.foundItemId) where.foundItemId = filters.foundItemId;

    return prisma.match.count({ where });
  }
}

export default MatchRepository;
