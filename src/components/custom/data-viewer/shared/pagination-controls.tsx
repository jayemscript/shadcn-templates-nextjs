// src/components/customs/data-viewer/shared/pagination-controls.tsx
"use client";

import { useId } from "react";
import { Table } from "@tanstack/react-table";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  Button,
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

interface PaginationControlsProps<T> {
  table: Table<T>;
  enableServerSide?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSizeOptions?: number[];
}

export function PaginationControls<T>({
  table,
  enableServerSide = false,
  totalItems = 0,
  currentPage = 1,
  pageSizeOptions = [10, 25, 50],
}: PaginationControlsProps<T>) {
  const id = useId();
  const { pageIndex, pageSize } = table.getState().pagination;

  const rangeStart = enableServerSide
    ? (currentPage - 1) * pageSize + 1
    : pageIndex * pageSize + 1;

  const rangeEnd = enableServerSide
    ? Math.min(currentPage * pageSize, totalItems)
    : Math.min((pageIndex + 1) * pageSize, table.getRowCount());

  const total = enableServerSide ? totalItems : table.getRowCount();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end lg:gap-8">
      <div className="flex items-center gap-3 justify-center lg:justify-start">
        <Label
          htmlFor={`${id}-page-size`}
          className="text-sm whitespace-nowrap"
        >
          Rows per page
        </Label>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger
            id={`${id}-page-size`}
            className="w-fit whitespace-nowrap"
          >
            <SelectValue placeholder="Select number of results" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="text-muted-foreground text-sm whitespace-nowrap text-center lg:text-left">
          <p aria-live="polite">
            <span className="text-foreground">{rangeStart}</span>-
            <span className="text-foreground">{rangeEnd}</span> of{" "}
            <span className="text-foreground">{total}</span>
          </p>
        </div>

        <Pagination>
          <PaginationContent className="cursor-pointer">
            <PaginationItem>
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to first page"
                className="h-8 w-8 p-0 lg:h-10 lg:w-10"
              >
                <ChevronFirstIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to previous page"
                className="h-8 w-8 p-0 lg:h-10 lg:w-10"
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to next page"
                className="h-8 w-8 p-0 lg:h-10 lg:w-10"
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="sm"
                variant="outline"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to last page"
                className="h-8 w-8 p-0 lg:h-10 lg:w-10"
              >
                <ChevronLastIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
