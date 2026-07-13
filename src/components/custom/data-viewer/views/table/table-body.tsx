// src/components/customs/data-viewer/views/table/table-body.tsx
"use client";

import { Table, flexRender } from "@tanstack/react-table";
import { Loader2Icon } from "lucide-react";
import { TableBody, TableCell, TableRow } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TableVariant } from "../../types/table";
import { tableBodyRowVariants, tableCellVariants } from "./table-variants";
import { TableSkeletonRows } from "../../shared/skeletons";
import { EmptyState } from "../../shared/empty-state";
import { getPinningStyles } from "./get-pinning-styles";

interface DataViewerTableBodyProps<T extends Record<string, unknown>> {
  table: Table<T>;
  columns: number;
  variant: TableVariant;
  loading: boolean;
  isInitialLoad: boolean;
  error: string | null;
  emptyStateMessage: string;
  enableColumnPinning: boolean;
  getRowColor?: (row: T) => string | undefined;
  onRetry?: () => void;
}

export function DataViewerTableBody<T extends Record<string, unknown>>({
  table,
  columns,
  variant,
  loading,
  isInitialLoad,
  error,
  emptyStateMessage,
  enableColumnPinning,
  getRowColor,
  onRetry,
}: DataViewerTableBodyProps<T>) {
  const rows = table.getRowModel().rows;

  return (
    <TableBody>
      {loading && isInitialLoad ? (
        <TableSkeletonRows
          count={table.getState().pagination.pageSize}
          columns={table.options.columns}
        />
      ) : loading ? (
        <TableRow>
          <TableCell colSpan={columns} className="h-24 text-center">
            <div className="flex items-center justify-center gap-2">
              <Loader2Icon className="animate-spin" size={20} />
              Loading...
            </div>
          </TableCell>
        </TableRow>
      ) : error ? (
        <TableRow>
          <TableCell colSpan={columns} className="h-24 p-0">
            <EmptyState
              message={emptyStateMessage}
              error={error}
              onRetry={onRetry}
            />
          </TableCell>
        </TableRow>
      ) : rows.length ? (
        rows.map((row) => {
          const rowColor =
            variant === "colored" ? getRowColor?.(row.original) : undefined;

          return (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className={tableBodyRowVariants({ variant })}
              style={rowColor ? { backgroundColor: rowColor } : undefined}
            >
              {row.getVisibleCells().map((cell) => {
                const pinningStyles = enableColumnPinning
                  ? getPinningStyles(cell.column)
                  : undefined;

                return (
                  <TableCell
                    key={cell.id}
                    style={pinningStyles}
                    className={cn(
                      tableCellVariants({ variant }),
                      pinningStyles && "bg-inherit",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={columns} className="h-24 p-0">
            <EmptyState message={emptyStateMessage} />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
