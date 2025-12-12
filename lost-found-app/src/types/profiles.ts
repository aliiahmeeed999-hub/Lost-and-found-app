/**
 * User Profile Types
 */

/**
 * User profile information returned from API
 */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  studentId: string | null;
  profileImage: string | null;
  bio: string | null;
  isVerified: boolean;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request body for updating user profile
 */
export interface UpdateProfileRequest {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  studentId?: string | null;
}

/**
 * API response for get profile
 */
export interface GetProfileResponse {
  success: boolean;
  user: UserProfile;
}

/**
 * API response for update profile
 */
export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

/**
 * Form data for edit profile (matches form values)
 */
export interface EditProfileFormData {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  bio: string;
  profileImage: string;
}

/**
 * Validation errors for profile form
 */
export interface ProfileFormErrors {
  name?: string;
  phone?: string;
  bio?: string;
  studentId?: string;
  profileImage?: string;
}
