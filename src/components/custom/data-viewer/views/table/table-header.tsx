// src/components/customs/data-viewer/views/table/table-header.tsx
"use client";

import { Table, flexRender } from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PinIcon,
  PinOffIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
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
            const canPin = enableColumnPinning && header.column.getCanPin();
            const pinnedSide = header.column.getIsPinned();
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
                  "h-11 relative bg-background group",
                  canSort && "select-none",
                )}
              >
                <div className="flex h-full items-center justify-between gap-1">
                  {header.isPlaceholder ? null : canSort ? (
                    <div
                      className="flex flex-1 h-full min-w-0 cursor-pointer items-center gap-2 select-none"
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          header.column.getToggleSortingHandler()?.(e);
                        }
                      }}
                      tabIndex={0}
                    >
                      <span className="truncate">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </span>
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
                    <span className="flex-1 min-w-0 truncate">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </span>
                  )}

                  {canPin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity",
                            pinnedSide && "opacity-100 text-primary",
                          )}
                          aria-label="Pin column"
                        >
                          {pinnedSide ? (
                            <PinIcon size={14} />
                          ) : (
                            <PinOffIcon size={14} />
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => header.column.pin("left")}
                        >
                          Pin left
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => header.column.pin("right")}
                        >
                          Pin right
                        </DropdownMenuItem>
                        {pinnedSide && (
                          <DropdownMenuItem
                            onClick={() => header.column.pin(false)}
                          >
                            Unpin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {enableColumnResizing && <ColumnResizer header={header} />}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}
