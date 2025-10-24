'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Rating {
  id: number;
  rating: number;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface ToolRatingProps {
  toolId: number;
}

export default function ToolRating({ toolId }: ToolRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRatingData();
  }, [toolId]);

  const fetchRatingData = async () => {
    try {
      const response = await apiClient.request(`/ai-tools/${toolId}/ratings/my`);
      setUserRating(response.rating?.rating || null);
      setAverageRating(response.average_rating);
      setRatingsCount(response.ratings_count);
    } catch (err) {
      console.error('Failed to fetch rating data:', err);
    }
  };

  const handleRatingChange = async (rating: number) => {
    setLoading(true);
    setError('');

    try {
      await apiClient.request(`/ai-tools/${toolId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ rating }),
      });
      
      setUserRating(rating);
      await fetchRatingData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save rating');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRating = async () => {
    setLoading(true);
    setError('');

    try {
      await apiClient.request(`/ai-tools/${toolId}/ratings`, {
        method: 'DELETE',
      });
      
      setUserRating(null);
      await fetchRatingData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => handleRatingChange(star) : undefined}
            disabled={!interactive || loading}
            className={`text-2xl ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-500 cursor-pointer' : ''} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Average Rating Display */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <div>
            {renderStars(Math.round(averageRating))}
            <p className="text-sm text-gray-600 mt-1">
              {ratingsCount} {ratingsCount === 1 ? 'rating' : 'ratings'}
            </p>
          </div>
        </div>
      </div>

      {/* User Rating */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Your Rating</h4>
        {userRating ? (
          <div className="flex items-center space-x-4">
            {renderStars(userRating, true)}
            <button
              onClick={handleRemoveRating}
              disabled={loading}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Remove rating
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">Rate this tool:</p>
            {renderStars(0, true)}
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {ratingsCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 w-8">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${Math.random() * 100}%` }} // Placeholder - would need actual distribution data
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
