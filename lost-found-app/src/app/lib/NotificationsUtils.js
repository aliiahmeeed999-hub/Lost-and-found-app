/**
 * Notification Utilities
 * Helper functions for creating and managing notifications
 */

export type NotificationType = 'match' | 'found' | 'message' | 'badge' | 'reminder' | 'nearby';

export interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification via API
 * @param params Notification parameters
 * @returns Created notification object or null on error
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const response = await fetch('/api/notifications/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create notification:', error);
      return null;
    }

    const data = await response.json();
    return data.notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'match':
      return '🎯'; // Match icon
    case 'found':
      return '✅'; // Found icon
    case 'message':
      return '💬'; // Message icon
    case 'badge':
      return '🏆'; // Badge/achievement icon
    case 'reminder':
      return '⏰'; // Reminder/clock icon
    case 'nearby':
      return '📍'; // Location icon
    default:
      return '🔔'; // Default bell
  }
}

/**
 * Get Tailwind color classes based on notification type
 */
export function getNotificationColor(type: NotificationType): {
  bg: string;
  text: string;
  border: string;
} {
  switch (type) {
    case 'match':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
      };
    case 'found':
      return {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-200',
      };
    case 'message':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
      };
    case 'badge':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
      };
    case 'reminder':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
      };
    case 'nearby':
      return {
        bg: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-200',
      };
  }
}

/**
 * Notification templates for common scenarios
 */
export const notificationTemplates = {
  /**
   * New match found for user's lost item
   */
  matchFound: (itemName: string, matchLink?: string) => ({
    type: 'match' as NotificationType,
    title: 'New Match Found! 🎯',
    message: `A potential match has been found for your "${itemName}". Check it out now!`,
    link: matchLink || '/dashboard?tab=matches',
  }),

  /**
   * Someone found the user's lost item
   */
  itemFound: (itemName: string, findLink?: string) => ({
    type: 'found' as NotificationType,
    title: 'Your Item Was Found! ✅',
    message: `Good news! Someone reported finding your "${itemName}"!`,
    link: findLink || '/dashboard?tab=found-items',
  }),

  /**
   * New message received
   */
  messageReceived: (senderName: string, messageLink?: string) => ({
    type: 'message' as NotificationType,
    title: 'New Message from ' + senderName,
    message: `${senderName} sent you a message. Click to view the conversation.`,
    link: messageLink || '/dashboard?tab=messages',
  }),

  /**
   * Achievement/badge earned
   */
  badgeEarned: (badgeName: string, badgeLink?: string) => ({
    type: 'badge' as NotificationType,
    title: 'Achievement Unlocked! 🏆',
    message: `Congratulations! You've earned the "${badgeName}" badge!`,
    link: badgeLink || '/profile/badges',
  }),

  /**
   * Reminder notification
   */
  reminder: (reminderText: string, actionLink?: string) => ({
    type: 'reminder' as NotificationType,
    title: 'Reminder ⏰',
    message: reminderText,
    link: actionLink || '/dashboard',
  }),

  /**
   * Someone nearby has a match
   */
  nearbyMatch: (distance: string, matchLink?: string) => ({
    type: 'nearby' as NotificationType,
    title: `Match Found Nearby! 📍`,
    message: `There's a potential match for your item ${distance} away. Check it out!`,
    link: matchLink || '/dashboard?tab=matches',
  }),
};

/**
 * Format relative time for display
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}
