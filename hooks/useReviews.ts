// hooks/useReviews.ts
import { useState, useEffect } from 'react';
import { Review } from '@/types';

interface UseReviewsOptions {
  providerId: string;
  page?: number;
  limit?: number;
}

/**
 * useReviews hook
 *
 * Fetches reviews for a provider by handling loading states, paginating responses, and supporting cancellation.
 *
 * @param options - Provider identifier with pagination options.
 * @returns An object containing reviews, loading status, error information, and a flag for more data.
 */
export const useReviews = ({ providerId, page = 1, limit = 10 }: UseReviewsOptions) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/providers/${providerId}/reviews?page=${page}&limit=${limit}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        setReviews(prevReviews => (page === 1 ? data.reviews : [...prevReviews, ...data.reviews]));
        setHasMore(data.hasMore);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err as Error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      controller.abort();
    };
  }, [providerId, page, limit]);

  return { reviews, loading, error, hasMore };
};
