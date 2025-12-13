/**
 * MONOLITHIC APPLICATION LAYER: /repositories
 * 
 * Notification Repository
 * Data access layer for Notification entity - handles all database queries for notifications
 * No business logic here, only CRUD operations and database interactions
 */

import { prisma } from '@/lib/prisma';
import { INotification, INotificationCreateRequest } from '@/lib/models/Notification';

export class NotificationRepository {
  /**
   * Find notification by ID
   */
  static async findById(id: number) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  /**
   * Find all notifications for a user
   */
  static async findByUserId(userId: number, skip?: number, take?: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: skip || 0,
      take: take || 10,
    });
  }

  /**
   * Count unread notifications for a user
   */
  static async countUnread(userId: number) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Find unread notifications for a user
   */
  static async findUnread(userId: number) {
    return prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create new notification
   */
  static async create(data: INotificationCreateRequest) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });
  }

  /**
   * Update notification by ID
   */
  static async updateById(id: number, data: { isRead?: boolean }) {
    return prisma.notification.update({
      where: { id },
      data: {
        isRead: data.isRead,
      },
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: number) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  /**
   * Delete notification by ID
   */
  static async deleteById(id: number) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteByUserId(userId: number) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Count notifications for a user
   */
  static async countByUserId(userId: number) {
    return prisma.notification.count({
      where: { userId },
    });
  }
}

export default NotificationRepository;
