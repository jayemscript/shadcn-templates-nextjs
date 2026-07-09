// src/components/customs/data-viewer/hooks/use-row-selection.ts
"use client";

import { useMemo } from "react";
import { useSelectionStore } from "../store/selection";
import { getRowId } from "../utils/get-row-id";

export interface UseRowSelectionReturn<T> {
  isSelected: (id: string) => boolean;
  toggleSelected: (id: string) => void;
  clearSelection: () => void;
  selectedCount: number;
  hasSelection: boolean;
  getSelectedRows: () => T[];
  getAllSelectedRowIds: () => string[];
  toggleAllPageRows: (value: boolean) => void;
  isAllPageRowsSelected: boolean;
  isSomePageRowsSelected: boolean;
}

/**
 * Wraps the selection store with page-aware helpers. `data` should be the
 * current page of rows — "select all" / "is all selected" are scoped to
 * what's actually on screen, not the full server-side dataset.
 */
export function useRowSelection<T extends Record<string, unknown>>(
  data: T[],
): UseRowSelectionReturn<T> {
  const selectedRowIds = useSelectionStore((s) => s.selectedRowIds);
  const toggleSelectedInStore = useSelectionStore((s) => s.toggleSelected);
  const clear = useSelectionStore((s) => s.clear);
  const store = useSelectionStore((s) => s.store);
  const clearSelected = useSelectionStore((s) => s.clearSelected);
  const getSelectedIds = useSelectionStore((s) => s.get);

  const pageRowIds = useMemo(
    () => data.map((row, index) => getRowId(row, index)),
    [data],
  );

  const getSelectedRows = () =>
    data.filter((_, index) => selectedRowIds.has(pageRowIds[index]));

  const toggleAllPageRows = (value: boolean) => {
    if (value) {
      store(pageRowIds);
    } else {
      clearSelected(pageRowIds);
    }
  };

  const isAllPageRowsSelected =
    pageRowIds.length > 0 && pageRowIds.every((id) => selectedRowIds.has(id));

  const isSomePageRowsSelected =
    !isAllPageRowsSelected && pageRowIds.some((id) => selectedRowIds.has(id));

  return {
    isSelected: (id) => selectedRowIds.has(id),
    toggleSelected: toggleSelectedInStore,
    clearSelection: clear,
    selectedCount: selectedRowIds.size,
    hasSelection: selectedRowIds.size > 0,
    getSelectedRows,
    getAllSelectedRowIds: getSelectedIds,
    toggleAllPageRows,
    isAllPageRowsSelected,
    isSomePageRowsSelected,
  };
}
