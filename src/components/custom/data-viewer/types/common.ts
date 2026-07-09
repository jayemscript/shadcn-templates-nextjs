// src/components/customs/data-viewer/types/common.ts
import { ReactNode } from "react";

/** Allowed shapes for a single filter's value. */
export type FilterValue = string | number | boolean | string[];

/** The full set of active filters, keyed by filter key. */
export type FilterState = Record<string, FilterValue>;

/** A single filter definition rendered in the filters dropdown. */
export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}

/** Params sent to the data source on every fetch (search, sort, page, filters). */
export interface FetchDataParams {
  page: number;
  limit: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: FilterState;
}

/** Shape every fetchData implementation must resolve to. */
export interface FetchDataResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/** A bulk action available when one or more rows are selected. */
export interface CheckboxAction<T = unknown> {
  label: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  icon?: ReactNode;
  action: (selectedRows: T[]) => void;
}

/** A single field mapping used by the default card renderer. */
export interface CardField<T = Record<string, unknown>> {
  key: keyof T | string;
  label?: string;
  render?: (value: unknown, row: T) => ReactNode;
  className?: string;
}
