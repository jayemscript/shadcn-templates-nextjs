// src/components/customs/data-viewer/views/card/card-view.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CardField,
  CheckboxAction,
  FetchDataParams,
  FetchDataResult,
  FilterOption,
  FilterState,
} from "../../types/common";
import { useDataViewer } from "../../hooks/use-data-viewer";
import { SearchInput } from "../../shared/toolbar/search-input";
import { ColumnVisibilityDropdown } from "../../shared/toolbar/column-visibility-dropdown";
import { FiltersDropdown } from "../../shared/toolbar/filters-dropdown";
import { BulkActions } from "../../shared/toolbar/bulk-actions";
import { PaginationControls } from "../../shared/pagination-controls";
import { EmptyState } from "../../shared/empty-state";
import { CardSkeletonGrid } from "../../shared/skeletons";
import { CardItem } from "./card-item";
import { getRowId } from "../../utils/get-row-id";

interface CardViewOwnProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;
  initialData?: T[];
  preloadedData?: FetchDataResult<T>;
  enableServerSide?: boolean;
  initialLoadDelay?: number;
  fetchLoadDelay?: number;

  className?: string;
  title?: string;
  description?: string;
  emptyStateMessage?: string;
  children?: ReactNode;

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

  enableRowSelection?: boolean;
  readOnly?: boolean;
  checkboxActions?: CheckboxAction<T>[];
  onRowAction?: (action: string, row: T) => void;

  enableSorting?: boolean;
  enablePagination?: boolean;
  pageSizeOptions?: number[];

  onAddNew?: () => void;
  addButtonText?: string;

  enableUrlSync?: boolean;
  storageKey?: string;

  cardComponent?: (props: { row: T; index: number }) => ReactNode;
  cardFields?: CardField<T>[];
  cardColumns?: 1 | 2 | 3 | 4 | 5;
}

const CARD_COLUMN_CLASSES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
};

export function CardView<T extends Record<string, unknown>>({
  columns,
  fetchData,
  initialData,
  preloadedData,
  enableServerSide = false,
  initialLoadDelay,
  fetchLoadDelay,

  className,
  title,
  description,
  emptyStateMessage = "No results found.",
  children,

  enableSearch = true,
  searchPlaceholder = "Search...",
  enableFilters,
  filterOptions,
  renderFilters,
  enableColumnVisibility = true,
  enableRefreshButton = true,
  refreshButtonText = "Refresh",
  onRefresh,

  enableRowSelection = true,
  readOnly = false,
  checkboxActions = [],
  onRowAction,

  enableSorting = true,
  enablePagination = true,
  pageSizeOptions = [10, 25, 50],

  onAddNew,
  addButtonText = "Add New",

  enableUrlSync = true,
  storageKey = "default",

  cardComponent,
  cardFields,
  cardColumns = 3,
}: CardViewOwnProps<T>) {
  const dataViewer = useDataViewer<T>({
    columns,
    fetchData,
    initialData,
    preloadedData,
    enableServerSide,
    initialLoadDelay,
    fetchLoadDelay,
    enableUrlSync,
    storageKey,
    pageSizeOptions,
    enableRowSelection,
    readOnly,
    enableSorting,
    enablePagination,
  });

  useEffect(() => {
    onRefresh?.(dataViewer.refreshData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveEnableRowSelection = enableRowSelection && !readOnly;
  const hasFilters =
    !!enableFilters && !!filterOptions && filterOptions.length > 0;
  const gridClass = CARD_COLUMN_CLASSES[cardColumns];

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {(children || renderFilters) && (
        <div className="space-y-4">
          {children}
          {renderFilters?.(dataViewer.filters, dataViewer.setFilters)}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {enableSearch && (
            <SearchInput
              value={dataViewer.searchValue}
              onChange={dataViewer.setSearchValue}
              placeholder={searchPlaceholder}
            />
          )}

          {enableColumnVisibility && (
            <ColumnVisibilityDropdown table={dataViewer.table} />
          )}

          {hasFilters && (
            <FiltersDropdown
              filterOptions={filterOptions!}
              filters={dataViewer.filters}
              onFiltersChange={dataViewer.setFilters}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {effectiveEnableRowSelection && dataViewer.hasSelection && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground order-last sm:order-first">
              <span>
                {dataViewer.selectedCount} row
                {dataViewer.selectedCount !== 1 ? "s" : ""} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={dataViewer.clearSelection}
                className="h-8 px-2 cursor-pointer"
              >
                Clear
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {effectiveEnableRowSelection && dataViewer.hasSelection && (
              <BulkActions
                actions={checkboxActions}
                selectedRows={dataViewer.getSelectedRows()}
                selectedCount={dataViewer.selectedCount}
                onActionComplete={dataViewer.clearSelection}
              />
            )}

            {enableRefreshButton && enableServerSide && (
              <Button
                onClick={dataViewer.refreshData}
                variant="outline"
                disabled={dataViewer.loading}
                size="sm"
                className="cursor-pointer"
              >
                <RefreshCwIcon
                  className={cn(
                    "-ms-1 opacity-60",
                    dataViewer.loading && "animate-spin",
                  )}
                  size={16}
                />
                <span className="hidden sm:inline">{refreshButtonText}</span>
              </Button>
            )}

            {onAddNew && (
              <Button
                onClick={onAddNew}
                variant="outline"
                size="sm"
                className="cursor-pointer"
              >
                <PlusIcon size={16} />
                <span className="hidden sm:inline">{addButtonText}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {dataViewer.loading && dataViewer.isInitialLoad ? (
        <div className={cn("grid gap-4", gridClass)}>
          <CardSkeletonGrid
            count={dataViewer.table.getState().pagination.pageSize}
          />
        </div>
      ) : dataViewer.error ? (
        <EmptyState
          message={emptyStateMessage}
          error={dataViewer.error}
          onRetry={dataViewer.refreshData}
        />
      ) : dataViewer.data.length === 0 ? (
        <EmptyState message={emptyStateMessage} />
      ) : (
        <div className={cn("grid gap-4 w-full max-w-full", gridClass)}>
          {dataViewer.data.map((row, index) => {
            const id = getRowId(row, index);
            return (
              <CardItem
                key={id}
                row={row}
                index={index}
                cardComponent={cardComponent}
                cardFields={cardFields}
                enableSelection={effectiveEnableRowSelection}
                isSelected={
                  dataViewer.table.getState().rowSelection[index.toString()] ??
                  false
                }
                onToggleSelect={() =>
                  dataViewer.table.getRow(index.toString()).toggleSelected()
                }
              />
            );
          })}
        </div>
      )}

      {enablePagination && (
        <PaginationControls
          table={dataViewer.table}
          enableServerSide={enableServerSide}
          totalItems={dataViewer.totalItems}
          currentPage={dataViewer.currentPage}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
