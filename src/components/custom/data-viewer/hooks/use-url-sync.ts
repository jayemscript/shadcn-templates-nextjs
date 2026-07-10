// src/components/customs/data-viewer/hooks/use-url-sync.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterState } from "../types/common";

const STORAGE_KEY_PREFIX = "dataViewer_";

export interface UrlSyncedState {
  pageIndex: number;
  pageSize: number;
  keyword: string;
  filters: FilterState;
}

interface UseUrlSyncOptions {
  enabled: boolean;
  storageKey: string;
  defaultPageSize?: number;
}

interface UseUrlSyncReturn {
  /** True once the initial URL/localStorage read has resolved. */
  isReady: boolean;
  /** The resolved starting state — only meaningful once isReady is true. */
  initialState: UrlSyncedState;
  /** Call whenever synced state changes, to push it into the URL + localStorage. */
  syncState: (state: UrlSyncedState) => void;
}

interface StoredState {
  page?: number;
  limit?: number;
  keyword?: string;
  filters?: FilterState;
}

function readStoredState(
  storageKey: string,
  defaultPageSize: number,
): UrlSyncedState | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${storageKey}`);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as StoredState;
    return {
      pageIndex: (parsed.page ?? 1) - 1,
      pageSize: parsed.limit ?? defaultPageSize,
      keyword: parsed.keyword ?? "",
      filters: parsed.filters ?? {},
    };
  } catch (e) {
    console.error("Failed to load data-viewer state from localStorage:", e);
    return null;
  }
}

/**
 * Syncs pagination/search/filters with the URL query string, mirroring the
 * same state into localStorage as a fallback for when URL params belong to a
 * different table instance (see the `tableKey` check) or aren't present yet.
 *
 * Reading is a one-time resolution on mount (URL + localStorage aren't
 * available during SSR). Writing is driven by the consumer calling
 * `syncState` from its own effect whenever pagination/search/filters change.
 */
export function useUrlSync({
  enabled,
  storageKey,
  defaultPageSize = 10,
}: UseUrlSyncOptions): UseUrlSyncReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isReady, setIsReady] = useState(!enabled);
  const initialStateRef = useRef<UrlSyncedState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
    keyword: "",
    filters: {},
  });

  useEffect(() => {
    if (!enabled) {
      setIsReady(true);
      return;
    }

    const urlTableKey = searchParams.get("tableKey");
    const shouldUseUrlParams = !urlTableKey || urlTableKey === storageKey;

    const urlPage = searchParams.get("page");
    const urlLimit = searchParams.get("limit");
    const urlKeyword = searchParams.get("keyword");
    const urlFilters = searchParams.get("filters");
    const hasUrlState = !!(urlPage || urlLimit || urlKeyword || urlFilters);

    if (shouldUseUrlParams && hasUrlState) {
      let filters: FilterState = {};
      if (urlFilters) {
        try {
          filters = JSON.parse(urlFilters) as FilterState;
        } catch (e) {
          console.error("Failed to parse filters from URL:", e);
        }
      }

      initialStateRef.current = {
        pageIndex: urlPage ? parseInt(urlPage, 10) - 1 : 0,
        pageSize: urlLimit ? parseInt(urlLimit, 10) : defaultPageSize,
        keyword: urlKeyword ?? "",
        filters,
      };
    } else {
      const stored = readStoredState(storageKey, defaultPageSize);
      if (stored) {
        initialStateRef.current = stored;
      }
    }

    setIsReady(true);
    // Intentionally runs once on mount only — this is a one-time hydration read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncState = useCallback(
    (state: UrlSyncedState) => {
      if (!enabled || !isReady) return;

      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("tableKey", storageKey);
      currentParams.set("page", String(state.pageIndex + 1));
      currentParams.set("limit", String(state.pageSize));

      if (state.keyword) {
        currentParams.set("keyword", state.keyword);
      } else {
        currentParams.delete("keyword");
      }

      if (Object.keys(state.filters).length > 0) {
        currentParams.set("filters", JSON.stringify(state.filters));
      } else {
        currentParams.delete("filters");
      }

      router.replace(`${pathname}?${currentParams.toString()}`, {
        scroll: false,
      });

      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${storageKey}`,
          JSON.stringify({
            page: state.pageIndex + 1,
            limit: state.pageSize,
            keyword: state.keyword,
            filters: state.filters,
          }),
        );
      } catch (e) {
        console.error("Failed to save data-viewer state to localStorage:", e);
      }
    },
    [enabled, isReady, pathname, router, searchParams, storageKey],
  );

  return { isReady, initialState: initialStateRef.current, syncState };
}
