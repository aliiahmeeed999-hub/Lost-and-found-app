/**
 * MONOLITHIC APPLICATION LAYER: /models
 * 
 * Match Data Model
 * Represents a potential match between Lost and Found items
 */

/**
 * Match Interface
 * Represents a potential match between a lost item and a found item
 */
export interface IMatch {
  id: number;
  lostItemId: number;
  foundItemId: number;
  matchScore: number;
  status: string; // 'pending', 'confirmed', 'rejected'
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Match Response with Item Details
 */
export interface IMatchResponse {
  id: number;
  lostItemId: number;
  foundItemId: number;
  matchScore: number;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lostItem?: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrls: string[];
    locationLost?: string;
    dateLost?: Date;
  };
  foundItem?: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrls: string[];
    locationFound?: string;
    dateFound?: Date;
  };
}

/**
 * Match Creation Request
 */
export interface IMatchCreateRequest {
  lostItemId: number;
  foundItemId: number;
  matchScore: number;
  notes?: string;
}

/**
 * Match Update Request
 */
export interface IMatchUpdateRequest {
  status?: string;
  notes?: string;
}

export default IMatch;
