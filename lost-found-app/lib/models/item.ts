/**
 * MONOLITHIC APPLICATION LAYER: /models
 * 
 * Item Data Model
 * Represents a Lost or Found Item in the application
 */

/**
 * Item Interface
 * Represents a Lost or Found item in the system
 */
export interface IItem {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string; // 'electronics', 'documents', 'keys', 'bags', 'clothing', 'accessories', 'books', 'other'
  status: string; // 'lost' or 'found'
  itemStatus: string; // 'active', 'reunited', 'closed'
  
  // Location
  locationLost?: string;
  locationFound?: string;
  locationDetails?: string;
  
  // Dates
  dateLost?: Date;
  dateFound?: Date;
  
  // Media & Details
  imageUrls: string[];
  contactInfo?: string;
  rewardAmount?: number;
  
  // Identifying features
  tags: string[];
  color?: string;
  brand?: string;
  distinguishingFeatures?: string;
  
  // Stats
  views: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item Create Request
 */
export interface IItemCreateRequest {
  title: string;
  description: string;
  category: string;
  status: string; // 'lost' or 'found'
  locationLost?: string;
  locationFound?: string;
  locationDetails?: string;
  dateLost?: string;
  dateFound?: string;
  imageUrls?: string[];
  contactInfo?: string;
  rewardAmount?: string;
  tags?: string[];
  color?: string;
  brand?: string;
  distinguishingFeatures?: string;
}

/**
 * Item Update Request
 */
export interface IItemUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  locationLost?: string;
  locationFound?: string;
  locationDetails?: string;
  dateLost?: string;
  dateFound?: string;
  imageUrls?: string[];
  contactInfo?: string;
  rewardAmount?: string;
  tags?: string[];
  color?: string;
  brand?: string;
  distinguishingFeatures?: string;
  itemStatus?: string;
}

/**
 * Item Response (Safe for API)
 */
export interface IItemResponse extends Omit<IItem, 'updatedAt'> {
  userProfile?: {
    id: number;
    name: string;
    reputation: number;
    profileImage?: string;
  };
}

export default IItem;
