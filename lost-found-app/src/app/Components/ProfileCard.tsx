'use client';

import { UserProfile } from '@/types/profile';
import Link from 'next/link';
import { Mail, Phone, User, BookOpen, Shield, Calendar, Edit3 } from 'lucide-react';

interface ProfileCardProps {
  user: UserProfile;
}

/**
 * ProfileCard Component
 * Displays user profile information in a clean card layout
 *//

export default function ProfileCard({ user }: ProfileCardProps) {
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header with background */}
      <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Profile content */}
      <div className="px-6 pb-6">
        {/* Avatar and name section */}
        <div className="flex items-end gap-4 mb-6 -mt-16 relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            {user.isVerified && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio section */}
        {user.bio && (
          <div className="mb-6">
            <p className="text-gray-600 leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* User info grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Email</p>
              <p className="text-gray-900 break-all">{user.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Phone</p>
              <p className="text-gray-900">{user.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Student ID */}
          {user.studentId && (
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Student ID</p>
                <p className="text-gray-900">{user.studentId}</p>
              </div>
            </div>
          )}

          {/* Reputation */}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Reputation</p>
              <p className="text-gray-900">{user.reputation} points</p>
            </div>
          </div>
        </div>

        {/* Join date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pb-6 border-b">
          <Calendar className="w-4 h-4" />
          <span>Joined {joinedDate}</span>
        </div>

        {/* Edit button */}
        <Link
          href="/profile/edit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Edit3 className="w-5 h-5" />
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
