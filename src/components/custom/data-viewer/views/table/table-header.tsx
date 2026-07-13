// src/components/customs/data-viewer/views/table/table-header.tsx
"use client";

import { Table, flexRender } from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TableVariant } from "../../types/table";
import { tableHeaderRowVariants } from "./table-variants";
import { ColumnResizer } from "./column-resizer";
import { getPinningStyles } from "./get-pinning-styles";

interface DataViewerTableHeaderProps<T> {
  table: Table<T>;
  variant: TableVariant;
  enableSorting: boolean;
  enableColumnResizing: boolean;
  enableColumnPinning: boolean;
}

export function DataViewerTableHeader<T>({
  table,
  variant,
  enableSorting,
  enableColumnResizing,
  enableColumnPinning,
}: DataViewerTableHeaderProps<T>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className={tableHeaderRowVariants({ variant })}
        >
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort() && enableSorting;
            const sortDirection = header.column.getIsSorted();
            const pinningStyles = enableColumnPinning
              ? getPinningStyles(header.column)
              : undefined;

            return (
              <TableHead
                key={header.id}
                style={{
                  width: `calc(var(--header-${header.id}-size) * 1px)`,
                  ...pinningStyles,
                }}
                className={cn(
                  "h-11 relative bg-background",
                  canSort && "select-none",
                )}
              >
                {header.isPlaceholder ? null : canSort ? (
                  <div
                    className="flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                    onClick={header.column.getToggleSortingHandler()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        header.column.getToggleSortingHandler()?.(e);
                      }
                    }}
                    tabIndex={0}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {sortDirection === "asc" && (
                      <ChevronUpIcon
                        className="shrink-0 opacity-60"
                        size={16}
                        aria-hidden="true"
                      />
                    )}
                    {sortDirection === "desc" && (
                      <ChevronDownIcon
                        className="shrink-0 opacity-60"
                        size={16}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ) : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )
                )}

                {enableColumnResizing && <ColumnResizer header={header} />}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}
