'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        console.log('Fetching item with ID:', params.id);

        const response = await fetch(`/api/items/${params.id}`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          // Safely parse JSON error
          let errorData = { message: 'Unknown error' };
          try {
            errorData = await response.json();
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          console.error('API Error:', errorData);

          if (response.status === 404) {
            setError('Item not found');
          } else {
            setError(errorData.message || 'Failed to load item');
          }
          return;
        }

        const data = await response.json();

        // Ensure arrays exist to prevent rendering errors
        const normalizedItem = {
          ...data,
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
        };

        console.log('Item data received:', normalizedItem);
        setItem(normalizedItem);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('An error occurred while loading the item');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItem();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <Link
              href="/items"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              ← Back to Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/items"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            ← Back to Items
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = item.status === 'lost' ? 'red' : 'green';
  const statusBg = item.status === 'lost' ? 'bg-red-100' : 'bg-green-100';
  const statusText = item.status === 'lost' ? 'text-red-800' : 'text-green-800';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/items"
          className="inline-block mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          ← Back to Items
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Item Images */}
            <div className="flex flex-col gap-4">
              {item.imageUrls.length > 0 ? (
                <>
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-96 relative">
                    <Image
                      src={item.imageUrls[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {item.imageUrls.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {item.imageUrls.map((img, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-100 rounded-lg overflow-hidden h-24 relative"
                        >
                          <Image
                            src={img}
                            alt={`${item.title} image ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex flex-col gap-6">
              {/* Title and Status */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-2 rounded-full font-semibold ${statusBg} ${statusText}`}>
                    {item.status === 'lost' ? '🔍 Lost' : '✓ Found'}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Location and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Location</h3>
                  <p className="text-lg text-gray-900">
                    {item.status === 'lost' ? item.locationLost : item.locationFound}
                  </p>
                  {item.locationDetails && (
                    <p className="text-sm text-gray-600">{item.locationDetails}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">
                    {item.status === 'lost' ? 'Date Lost' : 'Date Found'}
                  </h3>
                  <p className="text-lg text-gray-900">
                    {item.status === 'lost' && item.dateLost
                      ? new Date(item.dateLost).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : item.dateFound
                      ? new Date(item.dateFound).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {(item.rewardAmount || item.tags.length > 0 || item.color || item.brand || item.distinguishingFeatures) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  {item.rewardAmount && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Reward</h3>
                      <p className="text-xl font-bold text-green-600">${parseFloat(item.rewardAmount)}</p>
                    </div>
                  )}
                  {(item.color || item.brand) && (
                    <div className="mb-4">
                      {item.color && <p className="text-sm text-gray-700"><strong>Color:</strong> {item.color}</p>}
                      {item.brand && <p className="text-sm text-gray-700"><strong>Brand:</strong> {item.brand}</p>}
                    </div>
                  )}
                  {item.distinguishingFeatures && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700"><strong>Details:</strong> {item.distinguishingFeatures}</p>
                    </div>
                  )}
                  {item.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Posted By */}
              {item.user && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Posted By</h3>
                  <div className="flex items-center gap-4">
                    {item.user.profileImage && (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image src={item.user.profileImage} alt={item.user.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{item.user.name}</p>
                      <p className="text-sm text-gray-600">{item.user.email}</p>
                      {item.user.reputation !== undefined && (
                        <p className="text-sm text-yellow-600 font-semibold">
                          ★ {item.user.reputation || 0} reputation
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Button */}
              {item.user?.email && (
                <a
                  href={`mailto:${item.user.email}?subject=Inquiry about "${item.title}"`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition text-center"
                >
                  Contact Poster
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  
