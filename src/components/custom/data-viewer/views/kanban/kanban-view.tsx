// src/components/customs/data-viewer/views/kanban/kanban-view.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { RefreshCwIcon } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CheckboxAction,
  FetchDataParams,
  FetchDataResult,
  FilterOption,
  FilterState,
} from "../../types/common";
import { KanbanColumnDefinition } from "../../types/kanban";
import { useKanbanBoard } from "../../hooks/use-kanban-board";
import { SearchInput } from "../../shared/toolbar/search-input";
import { FiltersDropdown } from "../../shared/toolbar/filters-dropdown";
import { KanbanColumn } from "./kanban-column";

interface KanbanViewOwnProps<T extends Record<string, unknown>> {
  fetchData?: (params: FetchDataParams) => Promise<FetchDataResult<T>>;
  kanbanColumns: KanbanColumnDefinition<T>[];
  kanbanCardComponent?: (props: {
    row: T;
    index: number;
    columnId: string;
  }) => ReactNode;
  validTransitions?: Record<string, string[]>;
  onCardMove?: (
    row: T,
    fromColumnId: string,
    toColumnId: string,
  ) => Promise<void>;
  onCardMoveError?: (error: unknown, row: T) => void;

  className?: string;
  title?: string;
  description?: string;
  emptyStateMessage?: string;
  children?: ReactNode;

  enableSearch?: boolean;
  searchPlaceholder?: string;
  enableFilters?: boolean;
  filterOptions?: FilterOption[];
  renderFilters?: (
    filters: FilterState,
    setFilters: (filters: FilterState) => void,
  ) => ReactNode;
  enableRefreshButton?: boolean;
  refreshButtonText?: string;
  onRefresh?: (refresh: () => void) => void;
}

export function KanbanView<T extends Record<string, unknown>>({
  fetchData,
  kanbanColumns,
  kanbanCardComponent,
  validTransitions,
  onCardMove,
  onCardMoveError,

  className,
  title,
  description,
  emptyStateMessage = "No items found.",
  children,

  enableSearch = true,
  searchPlaceholder = "Search...",
  enableFilters,
  filterOptions,
  renderFilters,
  enableRefreshButton = true,
  refreshButtonText = "Refresh",
  onRefresh,
}: KanbanViewOwnProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [activeDrag, setActiveDrag] = useState<{
    row: T;
    fromColumnId: string;
  } | null>(null);

  const board = useKanbanBoard<T>({
    fetchData,
    kanbanColumns,
    searchValue,
    filters,
    validTransitions,
    onCardMove,
    onCardMoveError,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    onRefresh?.(board.refreshAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFilters =
    !!enableFilters && !!filterOptions && filterOptions.length > 0;

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as
      | { row: T; fromColumnId: string }
      | undefined;
    if (data) setActiveDrag({ row: data.row, fromColumnId: data.fromColumnId });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as
      | { row: T; fromColumnId: string }
      | undefined;
    if (!data) return;

    const toColumnId = String(over.id);
    board.moveCard(data.row, data.fromColumnId, toColumnId);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {(children || renderFilters) && (
        <div className="space-y-4">
          {children}
          {renderFilters?.(filters, setFilters)}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {enableSearch && (
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder={searchPlaceholder}
            />
          )}
          {hasFilters && (
            <FiltersDropdown
              filterOptions={filterOptions!}
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}
        </div>

        {enableRefreshButton && fetchData && (
          <Button onClick={board.refreshAll} variant="outline" size="sm">
            <RefreshCwIcon className="-ms-1 opacity-60" size={16} />
            <span className="hidden sm:inline">{refreshButtonText}</span>
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {kanbanColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                data={board.boardData.get(column.id) ?? []}
                loading={board.boardLoading.get(column.id) ?? false}
                hasMore={board.boardHasMore.get(column.id) ?? false}
                onLoadMore={() => board.loadMoreColumn(column.id)}
                onRefresh={() => board.refreshColumn(column.id)}
                kanbanCardComponent={kanbanCardComponent}
                emptyStateMessage={emptyStateMessage}
                isInvalidDropTarget={
                  !!activeDrag &&
                  activeDrag.fromColumnId !== column.id &&
                  !board.canDropInColumn(activeDrag.fromColumnId, column.id)
                }
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeDrag && (
            <Card className="w-80 shadow-lg opacity-90">
              <CardContent className="p-3">
                {kanbanCardComponent
                  ? kanbanCardComponent({
                      row: activeDrag.row,
                      index: 0,
                      columnId: activeDrag.fromColumnId,
                    })
                  : "Dragging..."}
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
