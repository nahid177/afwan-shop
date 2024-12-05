// src/components/CustomerReviews.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface Review {
  _id: string;
  user: string;
  jobTitle?: string;
  reviewText: string;
  imageUrl: string;
  isActive: boolean;
  approved: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/api/admin/reviews');
        setReviews(response.data.reviews);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {reviews.map((review) =>
        review.isActive && review.approved ? (
          <div
            key={review._id}
            className="flex-shrink-0 w-80 p-4 rounded-lg bg-white shadow-sm border border-slate-200 my-6"
          >
            <div className="flex items-center gap-4 text-slate-800">
              <div className="relative inline-block h-14 w-14">
                <Image
                  src={review.imageUrl}
                  alt={review.user}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h5 className="text-xl font-semibold text-slate-800">
                    {review.user}
                  </h5>
                </div>
                {review.jobTitle && (
                  <p className="text-xs uppercase font-bold text-slate-500 mt-0.5">
                    {review.jobTitle}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-base text-slate-600 font-light leading-normal">
                &quot;{review.reviewText}&quot;
              </p>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default CustomerReviews;
