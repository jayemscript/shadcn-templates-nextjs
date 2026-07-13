// src/components/customs/data-viewer/shared/skeletons.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  Skeleton,
  TableCell,
  TableRow,
} from "@/components/ui";

interface TableSkeletonRowsProps<T> {
  count: number;
  columns: ColumnDef<T>[];
}

/** Skeleton rows matching the current column count, for initial table load. */
export function TableSkeletonRows<T>({
  count,
  columns,
}: TableSkeletonRowsProps<T>) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((_, colIndex) => (
            <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface CardSkeletonGridProps {
  count: number;
}

/** Skeleton cards for initial load in card view. Not yet wired up — reserved
 *  for when card-view.tsx is built in a future session. */
export function CardSkeletonGrid({ count }: CardSkeletonGridProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Card key={`skeleton-card-${index}`}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
