// src/components/customs/data-viewer/views/kanban/kanban-column.tsx
"use client";

import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { KanbanColumnDefinition } from "../../types/kanban";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps<T extends Record<string, unknown>> {
  column: KanbanColumnDefinition<T>;
  data: T[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  kanbanCardComponent?: (props: {
    row: T;
    index: number;
    columnId: string;
  }) => ReactNode;
  emptyStateMessage?: string;
  /** True while a card is being dragged over this column but the drop isn't allowed. */
  isInvalidDropTarget: boolean;
}

export function KanbanColumn<T extends Record<string, unknown>>({
  column,
  data,
  loading,
  hasMore,
  onLoadMore,
  onRefresh,
  kanbanCardComponent,
  emptyStateMessage = "No items found.",
  isInvalidDropTarget,
}: KanbanColumnProps<T>) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const isInitialLoad = loading && data.length === 0;
  const showInvalidHighlight = isOver && isInvalidDropTarget;
  const showValidHighlight = isOver && !isInvalidDropTarget;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "shrink-0 w-80 flex flex-col bg-muted/50 rounded-lg transition-colors",
        showValidHighlight && "ring-2 ring-primary bg-primary/5",
        showInvalidHighlight && "ring-2 ring-destructive bg-destructive/5",
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          "p-4 border-b bg-card rounded-t-lg",
          column.color && "border-l-4",
        )}
        style={column.color ? { borderLeftColor: column.color } : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {column.icon && <span className="shrink-0">{column.icon}</span>}
              <h3 className="font-semibold text-sm truncate">{column.title}</h3>
            </div>
            {column.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {column.description}
              </p>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {isInitialLoad ? (
                <span>Loading...</span>
              ) : (
                <span>{data.length} items</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCwIcon
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-300px)]">
        {isInitialLoad ? (
          <SkeletonCards count={3} />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            {emptyStateMessage}
          </div>
        ) : (
          <>
            {data.map((row, index) => (
              <KanbanCard
                key={index}
                row={row}
                index={index}
                columnId={column.id}
                kanbanCardComponent={kanbanCardComponent}
              />
            ))}

            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            )}

            {loading && data.length > 0 && !hasMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2Icon className="h-4 w-4 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <Card key={`skeleton-${index}`} className="mb-3">
          <CardContent className="p-3 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
