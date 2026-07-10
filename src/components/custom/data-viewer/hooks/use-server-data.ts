// src/components/customs/data-viewer/hooks/use-server-data.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { FetchDataParams, FetchDataResult, FilterState } from "../types/common";
import { useUrlSync } from "./use-url-sync";

interface UseServerDataOptions<T extends Record<string, unknown>> {
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;
  initialData?: T[];
  preloadedData?: FetchDataResult<T>;
  enableServerSide?: boolean;
  initialLoadDelay?: number;
  fetchLoadDelay?: number;
  enableUrlSync?: boolean;
  storageKey?: string;
  pageSizeOptions?: number[];
}

export interface UseServerDataReturn<T> {
  data: T[];
  setData: (updater: T[] | ((prev: T[]) => T[])) => void;
  loading: boolean;
  isInitialLoad: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  searchValue: string;
  setSearchValue: (value: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  refreshData: () => void;
  /** Removes the given ids from local `data`. No-op in server-side mode — the
   *  actual delete request and refetch is the caller's responsibility there. */
  handleDeleteRows: (selectedIds: string[]) => void;
}

/**
 * Owns the data lifecycle for one DataViewer instance: fetching, pagination,
 * search, sorting, and filters, debounced and synced to the URL/localStorage
 * via useUrlSync. Works in both server-side (fetchData drives everything) and
 * client-side (initialData is the full dataset, TanStack's own row models
 * handle filtering/sorting/pagination) modes.
 */
export function useServerData<T extends Record<string, unknown>>({
  fetchData,
  initialData = [],
  preloadedData,
  enableServerSide = false,
  initialLoadDelay = 300,
  fetchLoadDelay = 100,
  enableUrlSync = true,
  storageKey = "default",
  pageSizeOptions = [10],
}: UseServerDataOptions<T>): UseServerDataReturn<T> {
  const hasPreloaded = !!preloadedData;
  const defaultPageSize = pageSizeOptions[0] ?? 10;

  const urlSync = useUrlSync({
    enabled: enableUrlSync,
    storageKey,
    defaultPageSize,
  });

  const [data, setData] = useState<T[]>(preloadedData?.data ?? initialData);
  const [loading, setLoading] = useState(
    enableServerSide && !!fetchData && !hasPreloaded,
  );
  const [isInitialLoad, setIsInitialLoad] = useState(
    enableServerSide && !!fetchData && !hasPreloaded,
  );
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(preloadedData?.totalItems ?? 0);
  const [totalPages, setTotalPages] = useState(preloadedData?.totalPages ?? 0);
  const [currentPage, setCurrentPage] = useState(
    preloadedData?.currentPage ?? 1,
  );

  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const prevSearchValueRef = useRef(searchValue);
  const isFirstFetchRef = useRef(true);

  // Seed state from URL/localStorage once useUrlSync resolves (one-time hydration).
  useEffect(() => {
    if (!urlSync.isReady) return;
    const {
      pageIndex,
      pageSize,
      keyword,
      filters: initialFilters,
    } = urlSync.initialState;
    setPagination({ pageIndex, pageSize });
    setSearchValue(keyword);
    setFilters(initialFilters);
    prevSearchValueRef.current = keyword;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSync.isReady]);

  // Push state changes back into the URL + localStorage.
  useEffect(() => {
    if (!urlSync.isReady) return;
    urlSync.syncState({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      keyword: searchValue,
      filters,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    searchValue,
    filters,
    urlSync.isReady,
  ]);

  // Reset to page 1 whenever search changes.
  useEffect(() => {
    if (prevSearchValueRef.current !== searchValue) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      prevSearchValueRef.current = searchValue;
    }
  }, [searchValue]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (!fetchData) return;

      setLoading(true);
      setError(null);

      const delay = isInitialLoad
        ? initialLoadDelay
        : isManualRefresh
          ? 0
          : fetchLoadDelay;

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      try {
        const sortBy = sorting[0]?.id;
        const sortOrder = sorting[0]
          ? sorting[0].desc
            ? "desc"
            : "asc"
          : undefined;

        const result = await fetchData({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          keyword: searchValue || undefined,
          sortBy,
          sortOrder,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        });

        setData(result.data);
        setTotalItems(result.totalItems);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);

        if (isInitialLoad) setIsInitialLoad(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [
      fetchData,
      isInitialLoad,
      initialLoadDelay,
      fetchLoadDelay,
      sorting,
      pagination.pageIndex,
      pagination.pageSize,
      searchValue,
      filters,
    ],
  );

  // Debounced fetch whenever any query-affecting state changes.
  useEffect(() => {
    if (!enableServerSide || !urlSync.isReady) return;

    if (isFirstFetchRef.current) {
      isFirstFetchRef.current = false;
      if (hasPreloaded) return;
    }

    const timeoutId = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchValue,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    filters,
    urlSync.isReady,
  ]);

  const refreshData = useCallback(() => {
    setPagination({ pageIndex: 0, pageSize: defaultPageSize });
    setSearchValue("");
    setFilters({});

    if (enableServerSide && fetchData) {
      loadData(true);
    }
  }, [defaultPageSize, enableServerSide, fetchData, loadData]);

  const handleDeleteRows = useCallback(
    (selectedIds: string[]) => {
      if (enableServerSide) return;

      setData((prev) =>
        prev.filter((item) => {
          const id = (item._id ?? item.id) as string | number | undefined;
          return id === undefined || !selectedIds.includes(String(id));
        }),
      );
    },
    [enableServerSide],
  );

  return {
    data,
    setData,
    loading,
    isInitialLoad,
    error,
    totalItems,
    totalPages,
    currentPage,
    searchValue,
    setSearchValue,
    filters,
    setFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
    refreshData,
    handleDeleteRows,
  };
}
