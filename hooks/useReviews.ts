// hooks/useReviews.ts
import { useState, useEffect } from 'react';
import { Review } from '@/types';

interface UseReviewsOptions {
  providerId: string;
  page?: number;
  limit?: number;
}

export const useReviews = ({ providerId, page = 1, limit = 10 }: UseReviewsOptions) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        const response = await fetch(
          `/api/providers/${providerId}/reviews?page=${page}&limit=${limit}`
        );
        const data = await response.json();
        setReviews(prevReviews => (page === 1 ? data.reviews : [...prevReviews, ...data.reviews]));
        setHasMore(data.hasMore);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [providerId, page, limit]);

  return { reviews, loading, error, hasMore };
};