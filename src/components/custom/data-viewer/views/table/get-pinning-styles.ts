// src/components/customs/data-viewer/views/table/get-pinning-styles.ts
import { Column } from "@tanstack/react-table";
import { CSSProperties } from "react";

/**
 * Official TanStack Table pattern for sticky column pinning. Shared between
 * table-header.tsx and table-body.tsx so both header and data cells for the
 * same pinned column stay visually aligned.
 *
 * Requires `border-collapse: separate` on the table wrapper — see
 * table-variants.ts / table-view.tsx.
 */
export function getPinningStyles<T>(column: Column<T, unknown>): CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeftPinned =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinned =
    isPinned === "right" && column.getIsFirstColumn("right");

  return {
    boxShadow: isLastLeftPinned
      ? "-4px 0 4px -4px rgb(0 0 0 / 0.15) inset"
      : isFirstRightPinned
        ? "4px 0 4px -4px rgb(0 0 0 / 0.15) inset"
        : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    zIndex: isPinned ? 1 : 0,
    width: `calc(var(--col-${column.id}-size) * 1px)`,
  };
}
