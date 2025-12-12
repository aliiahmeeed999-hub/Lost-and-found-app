'use client';

import { useState, useEffect } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import MatchCard from './MatchCard';

interface MatchData {
  id: number;
  matchScore: number;
  status: 'pending' | 'confirmed' | 'rejected';
  lostItem: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrls: string[];
    locationLost?: string;
    locationFound?: string;
    dateLost?: string;
    dateFound?: string;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      profileImage?: string;
    };
  };
  foundItem: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrls: string[];
    locationLost?: string;
    locationFound?: string;
    dateLost?: string;
    dateFound?: string;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      profileImage?: string;
    };
  };
}

interface MatchListProps {
  userId: number;
  title?: string;
  showOnlyPending?: boolean;
}

export default function MatchList({
  userId,
  title = 'Your Matches',
  showOnlyPending = false,
}: MatchListProps) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/match/list');

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      let filteredMatches = data.matches || [];

      if (showOnlyPending) {
        filteredMatches = filteredMatches.filter((m: MatchData) => m.status === 'pending');
      }

      setMatches(filteredMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (matchId: number) => {
    try {
      const response = await fetch('/api/match/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm match');
      }

      // Refresh matches list
      await fetchMatches();
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin" />
        </div>
        <p className="text-gray-600 mt-4">Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-900">Error</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-3 flex justify-center">
          <Heart className="w-16 h-16" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No matches yet</h3>
        <p className="text-gray-600">
          {showOnlyPending
            ? 'No pending matches. Check back soon!'
            : 'Post an item to start finding matches'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-600" />
        {title}
      </h2>

      <div className="space-y-6">
        {matches.map((match) => {
          const isLostItemOwner = match.lostItem.userId === userId;

          return (
            <MatchCard
              key={match.id}
              matchId={match.id}
              score={match.matchScore}
              lostItem={match.lostItem}
              foundItem={match.foundItem}
              isLostItemOwner={isLostItemOwner}
              status={match.status}
              onConfirm={handleConfirm}
            />
          );
        })}
      </div>
    </div>
  );
}
