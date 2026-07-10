// src/components/customs/data-viewer/shared/toolbar/column-visibility-dropdown.tsx
"use client";

import { Table } from "@tanstack/react-table";
import { Columns3Icon } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui";

interface ColumnVisibilityDropdownProps<T> {
  table: Table<T>;
}

export function ColumnVisibilityDropdown<T>({
  table,
}: ColumnVisibilityDropdownProps<T>) {
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  if (hideableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="shrink-0 cursor-pointer">
          <Columns3Icon
            className="-ms-1 opacity-60"
            size={16}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        {hideableColumns.map((column) => {
          const headerLabel =
            typeof column.columnDef.header === "string"
              ? column.columnDef.header
              : column.id;
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize cursor-pointer"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              onSelect={(event) => event.preventDefault()}
            >
              {headerLabel}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
