/**
 * MONOLITHIC APPLICATION LAYER: /models
 * 
 * User Data Model
 * Represents the structure of a User entity in the application
 */

import { ITEM_CATEGORIES, ITEM_STATUS, ITEM_CONDITION, MATCH_STATUS } from '@/lib/config/constants';

/**
 * User Profile Interface
 * Represents a user in the system
 */
export interface IUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  studentId?: string;
  profileImage?: string;
  bio?: string;
  isVerified: boolean;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User DTO (Data Transfer Object)
 * Safe user object for API responses (without password)
 */
export interface IUserResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  studentId?: string;
  profileImage?: string;
  bio?: string;
  isVerified: boolean;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Create Request
 */
export interface IUserCreateRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  studentId?: string;
}

/**
 * User Update Request
 */
export interface IUserUpdateRequest {
  name?: string;
  phone?: string;
  studentId?: string;
  profileImage?: string;
  bio?: string;
}

export default IUser;
