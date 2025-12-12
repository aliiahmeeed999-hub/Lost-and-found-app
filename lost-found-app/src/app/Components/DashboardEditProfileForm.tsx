'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, UpdateProfileRequest, ProfileFormErrors } from '@/types/profile';
import { AlertCircle, CheckCircle, Loader, ArrowLeft } from 'lucide-react';

interface DashboardEditProfileFormProps {
  user: UserProfile;
}

/**
 * DashboardEditProfileForm Component
 * Form for editing user profile in dashboard with validation
 */
export default function DashboardEditProfileForm({ user }: DashboardEditProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    bio: user.bio || '',
    studentId: user.studentId || '',
    profileImage: user.profileImage || '',
  });

  // ========================================
  // CLIENT-SIDE VALIDATION
  // ========================================

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate phone (optional, but if provided must be valid)
    if (formData.phone && !/^[0-9+\-().\s]*$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    // Validate bio (optional)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    // Validate student ID (optional, but if provided must be valid)
    if (formData.studentId && formData.studentId.length < 2) {
      newErrors.studentId = 'Student ID must be at least 2 characters';
    }

    // Validate profile image (optional, but if provided must be valid URL)
    if (formData.profileImage) {
      try {
        new URL(formData.profileImage);
      } catch {
        newErrors.profileImage = 'Invalid image URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // FORM SUBMISSION
  // ========================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare update data
      const updateData: UpdateProfileRequest = {};

      if (formData.name.trim() !== user.name) {
        updateData.name = formData.name.trim();
      }

      if (formData.phone !== (user.phone || '')) {
        updateData.phone = formData.phone || null;
      }

      if (formData.bio !== (user.bio || '')) {
        updateData.bio = formData.bio || null;
      }

      if (formData.studentId !== (user.studentId || '')) {
        updateData.studentId = formData.studentId || null;
      }

      if (formData.profileImage !== (user.profileImage || '')) {
        updateData.profileImage = formData.profileImage || null;
      }

      // Make API request
      const response = await fetch('/api/user/dashboard/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess(true);

      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ProfileFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900">Success!</p>
            <p className="text-sm text-green-800">Your profile has been updated. Redirecting...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Your full name"
            disabled={loading}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-gray-400 text-xs">(cannot be changed)</span>
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
            disabled={loading}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Student ID */}
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
            Student ID <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.studentId ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="e.g., STU123456"
            disabled={loading}
          />
          {errors.studentId && (
            <p className="text-sm text-red-600 mt-1">{errors.studentId}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio <span className="text-gray-400 text-xs">(optional, max 500 chars)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none ${
              errors.bio ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Tell us about yourself..."
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {formData.bio.length}/500
            </p>
          </div>
        </div>

        {/* Profile Image URL */}
        <div>
          <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image URL <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="url"
            id="profileImage"
            name="profileImage"
            value={formData.profileImage}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.profileImage ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="https://example.com/profile.jpg"
            disabled={loading}
          />
          {errors.profileImage && (
            <p className="text-sm text-red-600 mt-1">{errors.profileImage}</p>
          )}
          {formData.profileImage && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img
                src={formData.profileImage}
                alt="Profile preview"
                className="w-20 h-20 rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        {/* Form actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || success}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

