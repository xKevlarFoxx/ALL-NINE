// hooks/usePagination.ts
import { useState, useCallback } from 'react';

interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export const usePagination = ({ initialPage = 1, pageSize = 10 }: PaginationOptions = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore]);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

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