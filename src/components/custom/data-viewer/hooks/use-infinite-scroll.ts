// src/components/customs/data-viewer/hooks/use-infinite-scroll.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FetchDataParams, FetchDataResult, FilterState } from "../types/common";

interface UseInfiniteScrollOptions<T extends Record<string, unknown>> {
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;
  pageSize: number;
  searchValue: string;
  filters: FilterState;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  isInitialLoad: boolean;
  error: string | null;
  hasMore: boolean;
  totalItems: number;
  refresh: () => void;
  /** Attach to a sentinel element at the bottom of the list — its visibility
   *  triggers the next page fetch. Pass null to detach (e.g. on unmount). */
  sentinelRef: (node: HTMLElement | null) => void;
}

/**
 * Accumulating-page data fetcher for list view's infinite scroll. Unlike
 * useServerData (which replaces `data` on every fetch — correct for table/
 * card pagination), this appends each page's results, and re-fetches from
 * page 1 whenever search/filters/sort/pageSize change (a new query
 * invalidates whatever was already loaded).
 */
export function useInfiniteScroll<T extends Record<string, unknown>>({
  fetchData,
  pageSize,
  searchValue,
  filters,
  sortBy,
  sortOrder,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(!!fetchData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(!!fetchData);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const pageRef = useRef(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (!fetchData) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchData({
          page,
          limit: pageSize,
          keyword: searchValue || undefined,
          sortBy,
          sortOrder,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        });

        setData((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotalItems(result.totalItems);
        setHasMore(result.currentPage < result.totalPages);
        pageRef.current = result.currentPage;

        if (isInitialLoad) setIsInitialLoad(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      fetchData,
      pageSize,
      searchValue,
      filters,
      sortBy,
      sortOrder,
      isInitialLoad,
    ],
  );

  // Reset + refetch page 1 whenever the query itself changes. Debounced to
  // match useServerData's search/filter debounce behavior.
  useEffect(() => {
    if (!fetchData) return;

    const timeoutId = setTimeout(() => {
      pageRef.current = 1;
      setHasMore(true);
      fetchPage(1, false);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, pageSize, searchValue, filters, sortBy, sortOrder]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchPage(pageRef.current + 1, true);
  }, [loading, loadingMore, hasMore, fetchPage]);

  const refresh = useCallback(() => {
    pageRef.current = 1;
    setHasMore(true);
    fetchPage(1, false);
  }, [fetchPage]);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [loadMore],
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return {
    data,
    loading,
    loadingMore,
    isInitialLoad,
    error,
    hasMore,
    totalItems,
    refresh,
    sentinelRef,
  };
}
