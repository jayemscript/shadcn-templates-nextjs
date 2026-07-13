// src/components/customs/data-viewer/views/table/table-view.tsx
"use client";

import { useEffect } from "react";
import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { Button, Table } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TableViewProps } from "../../types/table";
import { useDataViewer } from "../../hooks/use-data-viewer";
import { useColumnResize } from "../../hooks/use-column-resize";
import { SearchInput } from "../../shared/toolbar/search-input";
import { ColumnVisibilityDropdown } from "../../shared/toolbar/column-visibility-dropdown";
import { FiltersDropdown } from "../../shared/toolbar/filters-dropdown";
import { BulkActions } from "../../shared/toolbar/bulk-actions";
import { PaginationControls } from "../../shared/pagination-controls";
import { tableWrapperVariants } from "./table-variants";
import { DataViewerTableHeader } from "./table-header";
import { DataViewerTableBody } from "./table-body";

export function TableView<T extends Record<string, unknown>>({
  columns,
  fetchData,
  initialData,
  preloadedData,
  enableServerSide = false,
  initialLoadDelay,
  fetchLoadDelay,

  variant = "default",
  getRowColor,
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
  enableColumnResizing = false,
  enableColumnPinning = false,

  enablePagination = true,
  pageSizeOptions = [10, 25, 50],

  onAddNew,
  addButtonText = "Add New",

  enableUrlSync = true,
  storageKey = "default",
}: TableViewProps<T>) {
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
    enableColumnResizing,
    enableColumnPinning,
    enablePagination,
  });

  const columnSizeVars = useColumnResize(dataViewer.table);

  useEffect(() => {
    onRefresh?.(dataViewer.refreshData);
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

      <div className={tableWrapperVariants({ variant })}>
        <Table
          className="min-w-full table-auto lg:table-fixed"
          style={{
            ...columnSizeVars,
            ...(enableColumnPinning
              ? { borderCollapse: "separate" }
              : undefined),
          }}
        >
          <DataViewerTableHeader
            table={dataViewer.table}
            variant={variant}
            enableSorting={enableSorting}
            enableColumnResizing={enableColumnResizing}
            enableColumnPinning={enableColumnPinning}
          />
          <DataViewerTableBody
            table={dataViewer.table}
            columns={columns.length}
            variant={variant}
            loading={dataViewer.loading}
            isInitialLoad={dataViewer.isInitialLoad}
            error={dataViewer.error}
            emptyStateMessage={emptyStateMessage}
            enableColumnPinning={enableColumnPinning}
            getRowColor={getRowColor}
            onRetry={dataViewer.refreshData}
          />
        </Table>
      </div>

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
