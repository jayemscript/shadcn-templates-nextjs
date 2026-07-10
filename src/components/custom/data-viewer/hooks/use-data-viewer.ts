// src/components/customs/data-viewer/hooks/use-data-viewer.ts
"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  ColumnSizingState,
  Table,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { FetchDataParams, FetchDataResult, FilterState } from "../types/common";
import { getRowId } from "../utils/get-row-id";
import { useServerData } from "./use-server-data";
import { useRowSelection } from "./use-row-selection";

interface UseDataViewerOptions<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;
  initialData?: T[];
  preloadedData?: FetchDataResult<T>;
  enableServerSide?: boolean;
  initialLoadDelay?: number;
  fetchLoadDelay?: number;
  enableUrlSync?: boolean;
  storageKey?: string;
  pageSizeOptions?: number[];
  enableRowSelection?: boolean;
  readOnly?: boolean;
  enableSorting?: boolean;
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;
  enablePagination?: boolean;
}

export interface UseDataViewerReturn<T> {
  table: Table<T>;
  data: T[];
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
  refreshData: () => void;
  deleteSelectedRows: () => void;
  selectedCount: number;
  hasSelection: boolean;
  clearSelection: () => void;
  getSelectedRows: () => T[];
  getAllSelectedRowIds: () => string[];
}

/**
 * Composes data-fetching (useServerData) and selection (useRowSelection) into
 * one configured TanStack Table instance. This is the single hook table-view
 * consumes — it shouldn't need to know about either sub-hook directly.
 */
export function useDataViewer<T extends Record<string, unknown>>({
  columns,
  fetchData,
  initialData,
  preloadedData,
  enableServerSide = false,
  initialLoadDelay,
  fetchLoadDelay,
  enableUrlSync = true,
  storageKey = "default",
  pageSizeOptions = [10, 25, 50],
  enableRowSelection = true,
  readOnly = false,
  enableSorting = true,
  enableColumnResizing = false,
  enableColumnPinning = false,
  enablePagination = true,
}: UseDataViewerOptions<T>): UseDataViewerReturn<T> {
  const serverData = useServerData<T>({
    fetchData,
    initialData,
    preloadedData,
    enableServerSide,
    initialLoadDelay,
    fetchLoadDelay,
    enableUrlSync,
    storageKey,
    pageSizeOptions,
  });

  const selection = useRowSelection<T>(serverData.data);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });

  const effectiveEnableRowSelection = enableRowSelection && !readOnly;

  // Map the store's `Set<id>` selection into the row-index-keyed shape
  // TanStack Table expects. Recomputes whenever the current page's data or
  // the selected ids change (isSelected's identity changes only then, since
  // useRowSelection subscribes to the store with a selector).
  const rowSelectionState = useMemo(() => {
    const map: Record<string, boolean> = {};
    serverData.data.forEach((item, index) => {
      const id = getRowId(item, index);
      if (selection.isSelected(id)) map[index.toString()] = true;
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverData.data, selection.isSelected]);

  const table = useReactTable({
    data: serverData.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableServerSide ? undefined : getSortedRowModel(),
    getFilteredRowModel: enableServerSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel:
      enableServerSide || !enablePagination
        ? undefined
        : getPaginationRowModel(),

    manualPagination: enableServerSide,
    manualSorting: enableServerSide,
    manualFiltering: enableServerSide,
    pageCount: enableServerSide ? serverData.totalPages : undefined,

    enableSorting,
    enableSortingRemoval: false, // intentional: sort always cycles asc/desc, never clears

    enableColumnResizing,
    columnResizeMode: "onEnd",

    enableColumnPinning,

    enableRowSelection: effectiveEnableRowSelection,

    state: {
      sorting: serverData.sorting,
      pagination: serverData.pagination,
      columnFilters,
      columnVisibility,
      columnSizing,
      columnPinning,
      rowSelection: rowSelectionState,
    },

    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(serverData.sorting) : updater;
      serverData.setSorting(next);
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(serverData.pagination)
          : updater;
      serverData.setPagination(next);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: (updater) => {
      const nextSelection =
        typeof updater === "function" ? updater(rowSelectionState) : updater;

      const allRowIndices = new Set([
        ...Object.keys(rowSelectionState),
        ...Object.keys(nextSelection),
      ]);

      allRowIndices.forEach((rowIndex) => {
        const wasSelected = !!rowSelectionState[rowIndex];
        const isNowSelected = !!nextSelection[rowIndex];
        if (wasSelected === isNowSelected) return;

        const index = parseInt(rowIndex, 10);
        const item = serverData.data[index];
        if (item) {
          selection.toggleSelected(getRowId(item, index));
        }
      });
    },
  });

  const deleteSelectedRows = () => {
    serverData.handleDeleteRows(selection.getAllSelectedRowIds());
    selection.clearSelection();
  };

  return {
    table,
    data: serverData.data,
    loading: serverData.loading,
    isInitialLoad: serverData.isInitialLoad,
    error: serverData.error,
    totalItems: serverData.totalItems,
    totalPages: serverData.totalPages,
    currentPage: serverData.currentPage,
    searchValue: serverData.searchValue,
    setSearchValue: serverData.setSearchValue,
    filters: serverData.filters,
    setFilters: serverData.setFilters,
    refreshData: serverData.refreshData,
    deleteSelectedRows,
    selectedCount: selection.selectedCount,
    hasSelection: selection.hasSelection,
    clearSelection: selection.clearSelection,
    getSelectedRows: selection.getSelectedRows,
    getAllSelectedRowIds: selection.getAllSelectedRowIds,
  };
}
