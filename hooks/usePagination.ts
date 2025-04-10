// hooks/usePagination.ts
import { useState, useCallback } from 'react';

interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = ({ initialPage = 1, pageSize = 10 }: PaginationOptions = {}) => {
  // Ensure initialPage and pageSize are positive integers
  if (initialPage < 1 || !Number.isInteger(initialPage)) {
    throw new Error('initialPage must be a positive integer');
  }
  if (pageSize < 1 || !Number.isInteger(pageSize)) {
    throw new Error('pageSize must be a positive integer');
  }

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  // Move to the next page if more pages are available
  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    } else {
      console.warn('No more pages to load'); // Warn if nextPage is called unnecessarily
    }
  }, [hasMore]);

  // Reset pagination to the initial state
  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  // Update the hasMore state
  const updateHasMore = useCallback((value: boolean) => {
    setHasMore(value);
  }, []);

  return {
    currentPage,
    pageSize,
    hasMore,
    nextPage,
    resetPagination,
    updateHasMore,
  };
};