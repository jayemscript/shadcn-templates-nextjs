"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import {
  useFileInputContext,
  useFileInputFiles,
} from "../hooks/use-file-input";
import { FileInputItem } from "./file-input-item";

export interface FileInputListProps {
  layout?: "list" | "grid" | "compact";
  className?: string;
}

export function FileInputList({
  layout = "list",
  className,
}: FileInputListProps) {
  const { config, reorderFiles } = useFileInputContext();
  const files = useFileInputFiles();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIndex = files.findIndex((f) => f.id === active.id);
      const toIndex = files.findIndex((f) => f.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;
      reorderFiles(fromIndex, toIndex);
    },
    [files, reorderFiles],
  );

  if (files.length === 0) return null;

  const containerClass =
    layout === "grid"
      ? "grid grid-cols-3 gap-2 sm:grid-cols-4"
      : layout === "compact"
        ? "flex flex-wrap gap-1.5"
        : "flex flex-col gap-2";

  const canReorder = config.reorderable && config.isMulti;

  if (!canReorder) {
    return (
      <div className={cn(containerClass, className)}>
        {files.map((f) => (
          <FileInputItem
            key={f.id}
            managedFile={f}
            fileType={config.fileType}
            layout={layout}
            reorderable={false}
          />
        ))}
      </div>
    );
  }

  const items = files.map((f) => f.id);
  const strategy =
    layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={strategy}>
        <div className={cn(containerClass, className)}>
          {files.map((f) => (
            <FileInputItem
              key={f.id}
              managedFile={f}
              fileType={config.fileType}
              layout={layout}
              reorderable
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
