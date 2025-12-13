/**
 * MONOLITHIC APPLICATION LAYER: /models
 * 
 * Notification Data Model
 * Represents notifications for users
 */

/**
 * Notification Interface
 * Represents a notification in the system
 */
export interface INotification {
  id: number;
  userId: number;
  type: string; // 'match', 'message', 'update', 'system'
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notification Create Request
 */
export interface INotificationCreateRequest {
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
}

/**
 * Notification Update Request
 */
export interface INotificationUpdateRequest {
  isRead?: boolean;
}

/**
 * Notification Response
 */
export interface INotificationResponse extends INotification {}

export default INotification;
