// src/components/customs/data-viewer/types/table.ts
import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";
import {
  CheckboxAction,
  FetchDataParams,
  FetchDataResult,
  FilterOption,
  FilterState,
} from "./common";

/** Visual treatment for the table view. */
export type TableVariant = "default" | "bordered" | "colored";

export interface TableViewProps<T extends Record<string, unknown>> {
  // data + fetching
  columns: ColumnDef<T>[];
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;
  initialData?: T[];
  preloadedData?: FetchDataResult<T>;
  enableServerSide?: boolean;
  initialLoadDelay?: number;
  fetchLoadDelay?: number;

  // appearance
  variant?: TableVariant;
  getRowColor?: (row: T) => string | undefined;
  className?: string;
  title?: string;
  description?: string;
  emptyStateMessage?: string;
  children?: ReactNode;

  // toolbar
  enableSearch?: boolean;
  searchPlaceholder?: string;
  enableFilters?: boolean;
  filterOptions?: FilterOption[];
  renderFilters?: (
    filters: FilterState,
    setFilters: (filters: FilterState) => void,
  ) => ReactNode;
  enableColumnVisibility?: boolean;
  enableRefreshButton?: boolean;
  refreshButtonText?: string;
  onRefresh?: (refresh: () => void) => void;

  // row behavior
  enableRowSelection?: boolean;
  readOnly?: boolean;
  checkboxActions?: CheckboxAction<T>[];
  onRowAction?: (action: string, row: T) => void;

  // column behavior
  enableSorting?: boolean;
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;

  // pagination
  enablePagination?: boolean;
  pageSizeOptions?: number[];

  // add button
  onAddNew?: () => void;
  addButtonText?: string;

  // persistence
  enableUrlSync?: boolean;
  storageKey?: string;
}
