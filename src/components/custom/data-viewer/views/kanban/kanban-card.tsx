// src/components/customs/data-viewer/views/kanban/kanban-card.tsx
"use client";

import { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getRowId } from "../../utils/get-row-id";

interface KanbanCardProps<T extends Record<string, unknown>> {
  row: T;
  index: number;
  columnId: string;
  kanbanCardComponent?: (props: {
    row: T;
    index: number;
    columnId: string;
  }) => ReactNode;
}

export function KanbanCard<T extends Record<string, unknown>>({
  row,
  index,
  columnId,
  kanbanCardComponent,
}: KanbanCardProps<T>) {
  const rowId = getRowId(row, index);
  const dragId = `${columnId}::${rowId}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId,
      data: { row, fromColumnId: columnId },
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "mb-3 cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-50",
      )}
    >
      <CardContent className="p-0">
        {kanbanCardComponent ? (
          kanbanCardComponent({ row, index, columnId })
        ) : (
          <DefaultKanbanCard row={row} />
        )}
      </CardContent>
    </Card>
  );
}

function DefaultKanbanCard<T extends Record<string, unknown>>({
  row,
}: {
  row: T;
}) {
  const title = (row.name ?? row.title ?? row.id) as string | undefined;
  return (
    <div className="p-3 text-sm">
      {title !== undefined ? String(title) : "Item"}
    </div>
  );
}
