// src/components/customs/data-viewer/hooks/use-kanban-board.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FetchDataParams, FetchDataResult, FilterState } from "../types/common";
import { KanbanColumnDefinition } from "../types/kanban";
import { getRowId } from "../utils/get-row-id";

interface UseKanbanBoardOptions<T extends Record<string, unknown>> {
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;
  kanbanColumns: KanbanColumnDefinition<T>[];
  pageSize?: number;
  searchValue: string;
  filters: FilterState;
  validTransitions?: Record<string, string[]>;
  onCardMove?: (
    row: T,
    fromColumnId: string,
    toColumnId: string,
  ) => Promise<void>;
  onCardMoveError?: (error: unknown, row: T) => void;
}

interface UseKanbanBoardReturn<T> {
  boardData: Map<string, T[]>;
  boardLoading: Map<string, boolean>;
  boardHasMore: Map<string, boolean>;
  loadMoreColumn: (columnId: string) => void;
  refreshColumn: (columnId: string) => void;
  refreshAll: () => void;
  /** Returns false immediately (no-op) if the transition isn't allowed per validTransitions. */
  canDropInColumn: (fromColumnId: string, toColumnId: string) => boolean;
  /** Optimistically moves a card between columns; reverts automatically if onCardMove rejects. */
  moveCard: (row: T, fromColumnId: string, toColumnId: string) => void;
}

export function useKanbanBoard<T extends Record<string, unknown>>({
  fetchData,
  kanbanColumns,
  pageSize = 20,
  searchValue,
  filters,
  validTransitions,
  onCardMove,
  onCardMoveError,
}: UseKanbanBoardOptions<T>): UseKanbanBoardReturn<T> {
  const [boardData, setBoardData] = useState<Map<string, T[]>>(new Map());
  const [boardLoading, setBoardLoading] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [boardHasMore, setBoardHasMore] = useState<Map<string, boolean>>(
    new Map(),
  );

  const pageRefs = useRef<Map<string, number>>(new Map());
  const isFirstRun = useRef(true);

  const loadColumn = useCallback(
    async (
      column: KanbanColumnDefinition<T>,
      page: number,
      append: boolean,
    ) => {
      if (!fetchData) return;

      setBoardLoading((prev) => new Map(prev).set(column.id, true));

      try {
        const result = await fetchData({
          page,
          limit: pageSize,
          keyword: searchValue || undefined,
          filters: {
            ...filters,
            [column.filterKey]: column.filterValue,
          } as FilterState,
        });

        setBoardData((prev) => {
          const next = new Map(prev);
          const existing = next.get(column.id) ?? [];
          next.set(
            column.id,
            append ? [...existing, ...result.data] : result.data,
          );
          return next;
        });

        setBoardHasMore((prev) =>
          new Map(prev).set(column.id, result.currentPage < result.totalPages),
        );

        pageRefs.current.set(column.id, result.currentPage);
      } catch {
        // Column-level fetch failures stay silent here — same reasoning as
        // onCardMoveError: notification is the consumer's responsibility,
        // this hook only owns data state.
      } finally {
        setBoardLoading((prev) => new Map(prev).set(column.id, false));
      }
    },
    [fetchData, pageSize, searchValue, filters],
  );

  const loadAllColumns = useCallback(
    (append: boolean) => {
      kanbanColumns.forEach((column) => {
        const page = append ? (pageRefs.current.get(column.id) ?? 1) + 1 : 1;
        if (!append) pageRefs.current.set(column.id, 1);
        loadColumn(column, page, append);
      });
    },
    [kanbanColumns, loadColumn],
  );

  // Initial load + debounced re-fetch whenever search/filters change.
  useEffect(() => {
    if (!fetchData || kanbanColumns.length === 0) return;

    if (isFirstRun.current) {
      isFirstRun.current = false;
      loadAllColumns(false);
      return;
    }

    const timeoutId = setTimeout(() => loadAllColumns(false), 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, searchValue, filters, kanbanColumns.length]);

  const loadMoreColumn = useCallback(
    (columnId: string) => {
      const column = kanbanColumns.find((c) => c.id === columnId);
      if (!column || boardLoading.get(columnId) || !boardHasMore.get(columnId))
        return;
      const nextPage = (pageRefs.current.get(columnId) ?? 1) + 1;
      loadColumn(column, nextPage, true);
    },
    [kanbanColumns, boardLoading, boardHasMore, loadColumn],
  );

  const refreshColumn = useCallback(
    (columnId: string) => {
      const column = kanbanColumns.find((c) => c.id === columnId);
      if (!column) return;
      pageRefs.current.set(columnId, 1);
      loadColumn(column, 1, false);
    },
    [kanbanColumns, loadColumn],
  );

  const refreshAll = useCallback(() => loadAllColumns(false), [loadAllColumns]);

  const canDropInColumn = useCallback(
    (fromColumnId: string, toColumnId: string) => {
      if (fromColumnId === toColumnId) return true;
      if (!validTransitions) return true;
      return validTransitions[fromColumnId]?.includes(toColumnId) ?? false;
    },
    [validTransitions],
  );

  const moveCard = useCallback(
    (row: T, fromColumnId: string, toColumnId: string) => {
      if (fromColumnId === toColumnId) return;
      if (!canDropInColumn(fromColumnId, toColumnId)) return;

      const rowId = getRowId(row, 0);

      // Optimistic move: happens synchronously, before onCardMove resolves.
      setBoardData((prev) => {
        const next = new Map(prev);
        const fromRows = (next.get(fromColumnId) ?? []).filter(
          (r, i) => getRowId(r, i) !== rowId,
        );
        const toRows = [row, ...(next.get(toColumnId) ?? [])];
        next.set(fromColumnId, fromRows);
        next.set(toColumnId, toRows);
        return next;
      });

      if (!onCardMove) return;

      onCardMove(row, fromColumnId, toColumnId).catch((error) => {
        // Revert on failure.
        setBoardData((prev) => {
          const next = new Map(prev);
          const toRows = (next.get(toColumnId) ?? []).filter(
            (r, i) => getRowId(r, i) !== rowId,
          );
          const fromRows = [row, ...(next.get(fromColumnId) ?? [])];
          next.set(fromColumnId, fromRows);
          next.set(toColumnId, toRows);
          return next;
        });
        onCardMoveError?.(error, row);
      });
    },
    [canDropInColumn, onCardMove, onCardMoveError],
  );

  return {
    boardData,
    boardLoading,
    boardHasMore,
    loadMoreColumn,
    refreshColumn,
    refreshAll,
    canDropInColumn,
    moveCard,
  };
}
