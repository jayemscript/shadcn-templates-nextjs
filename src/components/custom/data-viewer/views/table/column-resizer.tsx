// src/components/customs/data-viewer/views/table/column-resizer.tsx
"use client";

import { Header } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface ColumnResizerProps<T> {
  header: Header<T, unknown>;
}

/**
 * Drag handle rendered at the trailing edge of a resizable header. Wires
 * into header.getResizeHandler() for both mouse and touch. Since the table
 * uses columnResizeMode: "onEnd" (see use-data-viewer.ts), the handle itself
 * renders a live translateX indicator during drag via deltaOffset, while the
 * committed column width only updates once the drag is released.
 */
export function ColumnResizer<T>({ header }: ColumnResizerProps<T>) {
  if (!header.column.getCanResize()) return null;

  const isResizing = header.column.getIsResizing();
  const deltaOffset = header.getContext().table.getState()
    .columnSizingInfo.deltaOffset;

  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      onDoubleClick={() => header.column.resetSize()}
      className={cn(
        "absolute top-0 right-0 h-full w-1.5 cursor-col-resize select-none touch-none",
        "hover:bg-primary/40",
        isResizing && "bg-primary",
      )}
      style={
        isResizing && deltaOffset
          ? { transform: `translateX(${deltaOffset}px)` }
          : undefined
      }
    >
      <div className="absolute inset-y-0 right-0 w-px bg-border" />
    </div>
  );
}
