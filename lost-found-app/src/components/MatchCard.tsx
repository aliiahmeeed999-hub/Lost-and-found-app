'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, MapPin, Calendar } from 'lucide-react';

interface ItemData {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrls: string[];
  locationLost?: string;
  locationFound?: string;
  dateLost?: string;
  dateFound?: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface MatchCardProps {
  matchId: number;
  score: number;
  lostItem: ItemData;
  foundItem: ItemData;
  isLostItemOwner: boolean;
  status: 'pending' | 'confirmed' | 'rejected';
  onConfirm: (matchId: number) => Promise<void>;
}

export default function MatchCard({
  matchId,
  score,
  lostItem,
  foundItem,
  isLostItemOwner,
  status,
  onConfirm,
}: MatchCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scorePercentage = Math.round(score * 100);
  const otherItem = isLostItemOwner ? foundItem : lostItem;
  const otherUser = otherItem.user;

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      setError(null);
      await onConfirm(matchId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm match');
    } finally {
      setIsConfirming(false);
    }
  };

  // Determine location to display
  const itemLocation = isLostItemOwner
    ? foundItem.locationFound || foundItem.locationLost || 'Unknown location'
    : lostItem.locationLost || lostItem.locationFound || 'Unknown location';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-6 p-6">
        {/* Item Image & Info */}
        <div>
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
            {otherItem.imageUrls && otherItem.imageUrls.length > 0 ? (
              <Image
                src={otherItem.imageUrls[0]}
                alt={otherItem.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">{otherItem.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{otherItem.description}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-sm">{itemLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-sm">
                {isLostItemOwner && foundItem.dateFound
                  ? new Date(foundItem.dateFound).toLocaleDateString()
                  : lostItem.dateLost
                  ? new Date(lostItem.dateLost).toLocaleDateString()
                  : 'Unknown date'}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score & Other User Info */}
        <div className="flex flex-col justify-between">
          {/* Score Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Match Score</h4>

            {/* Score Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Similarity</span>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {scorePercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>

            {scorePercentage >= 85 && (
              <p className="text-sm text-green-600 font-medium mb-4">🎯 High confidence match!</p>
            )}
            {scorePercentage >= 70 && scorePercentage < 85 && (
              <p className="text-sm text-amber-600 font-medium mb-4">Good match potential</p>
            )}
          </div>

          {/* Other User Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Contact Person</p>
            <div className="flex items-center gap-3">
              {otherUser.profileImage && (
                <img
                  src={otherUser.profileImage}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{otherUser.name}</p>
                <p className="text-sm text-gray-600">{otherUser.email}</p>
              </div>
            </div>
          </div>

          {/* Status & Action */}
          <div>
            {status === 'confirmed' ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Match Confirmed</span>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirming ? 'Confirming...' : 'Confirm Match'}
              </button>
            )}

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
