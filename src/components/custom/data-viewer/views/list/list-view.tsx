// src/components/customs/data-viewer/views/list/list-view.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CheckboxAction,
  FetchDataParams,
  FetchDataResult,
  FilterOption,
  FilterState,
} from "../../types/common";
import { useInfiniteScroll } from "../../hooks/use-infinite-scroll";
import { useRowSelection } from "../../hooks/use-row-selection";
import { SearchInput } from "../../shared/toolbar/search-input";
import { FiltersDropdown } from "../../shared/toolbar/filters-dropdown";
import { BulkActions } from "../../shared/toolbar/bulk-actions";
import { EmptyState } from "../../shared/empty-state";
import { ListItem } from "./list-item";
import { getRowId } from "../../utils/get-row-id";

interface ListViewOwnProps<T extends Record<string, unknown>> {
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;

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
  enableRefreshButton?: boolean;
  refreshButtonText?: string;
  onRefresh?: (refresh: () => void) => void;

  enableRowSelection?: boolean;
  readOnly?: boolean;
  checkboxActions?: CheckboxAction<T>[];

  pageSizeOptions?: number[];

  primaryField: keyof T | string;
  secondaryField?: keyof T | string;
  listItemComponent?: (props: { row: T; index: number }) => ReactNode;
  listItemIcon?: (row: T) => ReactNode;
  listItemActions?: (row: T) => ReactNode;
}

export function ListView<T extends Record<string, unknown>>({
  fetchData,

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
  enableRefreshButton = true,
  refreshButtonText = "Refresh",
  onRefresh,

  enableRowSelection = true,
  readOnly = false,
  checkboxActions = [],

  pageSizeOptions = [10, 25, 50],

  primaryField,
  secondaryField,
  listItemComponent,
  listItemIcon,
  listItemActions,
}: ListViewOwnProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? 10);

  const infiniteScroll = useInfiniteScroll<T>({
    fetchData,
    pageSize,
    searchValue,
    filters,
  });

  const selection = useRowSelection<T>(infiniteScroll.data);

  useEffect(() => {
    onRefresh?.(infiniteScroll.refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveEnableRowSelection = enableRowSelection && !readOnly;
  const hasFilters =
    !!enableFilters && !!filterOptions && filterOptions.length > 0;

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
          {renderFilters?.(filters, setFilters)}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {enableSearch && (
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder={searchPlaceholder}
            />
          )}

          {hasFilters && (
            <FiltersDropdown
              filterOptions={filterOptions!}
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Items per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per load
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {effectiveEnableRowSelection && selection.hasSelection && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground order-last sm:order-first">
              <span>
                {selection.selectedCount} row
                {selection.selectedCount !== 1 ? "s" : ""} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={selection.clearSelection}
                className="h-8 px-2"
              >
                Clear
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {effectiveEnableRowSelection && selection.hasSelection && (
              <BulkActions
                actions={checkboxActions}
                selectedRows={selection.getSelectedRows()}
                selectedCount={selection.selectedCount}
                onActionComplete={selection.clearSelection}
              />
            )}

            {enableRefreshButton && fetchData && (
              <Button
                onClick={infiniteScroll.refresh}
                variant="outline"
                disabled={infiniteScroll.loading}
                size="sm"
              >
                <RefreshCwIcon
                  className={cn(
                    "-ms-1 opacity-60",
                    infiniteScroll.loading && "animate-spin",
                  )}
                  size={16}
                />
                <span className="hidden sm:inline">{refreshButtonText}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {infiniteScroll.loading && infiniteScroll.isInitialLoad ? (
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="animate-spin" size={20} />
        </div>
      ) : infiniteScroll.error ? (
        <EmptyState
          message={emptyStateMessage}
          error={infiniteScroll.error}
          onRetry={infiniteScroll.refresh}
        />
      ) : infiniteScroll.data.length === 0 ? (
        <EmptyState message={emptyStateMessage} />
      ) : (
        <div className="space-y-2">
          {infiniteScroll.data.map((row, index) => {
            const id = getRowId(row, index);
            return (
              <ListItem
                key={id}
                row={row}
                index={index}
                primaryField={primaryField}
                secondaryField={secondaryField}
                listItemComponent={listItemComponent}
                listItemIcon={listItemIcon}
                listItemActions={listItemActions}
                enableSelection={effectiveEnableRowSelection}
                isSelected={selection.isSelected(id)}
                onToggleSelect={() => selection.toggleSelected(id)}
              />
            );
          })}

          {infiniteScroll.hasMore && (
            <div
              ref={infiniteScroll.sentinelRef}
              className="flex items-center justify-center py-4"
            >
              {infiniteScroll.loadingMore && (
                <Loader2Icon className="animate-spin" size={16} />
              )}
            </div>
          )}

          {!infiniteScroll.hasMore && infiniteScroll.data.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              {infiniteScroll.totalItems} of {infiniteScroll.totalItems} loaded
            </p>
          )}
        </div>
      )}
    </div>
  );
}
