"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileInputFileType, ManagedFile } from "../types/file-input";
import { FileInputPreview } from "./file-input-preview";
import { FileInputProgress } from "./file-input-progress";
import { FileInputActions } from "./file-input-actions";
import { formatBytes } from "../utils/file-size";

export interface FileInputItemProps {
  managedFile: ManagedFile;
  fileType: FileInputFileType;
  layout?: "list" | "grid" | "compact";
  reorderable?: boolean;
  className?: string;
}

export function FileInputItem({
  managedFile,
  fileType,
  layout = "list",
  reorderable = false,
  className,
}: FileInputItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: managedFile.id,
    disabled: !reorderable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandle = reorderable ? (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="shrink-0 cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
      aria-label={`Reorder ${managedFile.file.name}`}
    >
      <GripVertical className="h-4 w-4" aria-hidden="true" />
    </button>
  ) : null;

  if (layout === "grid") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative aspect-square overflow-hidden rounded-md border border-border bg-muted",
          className,
        )}
      >
        <FileInputPreview
          managedFile={managedFile}
          fileType={fileType}
          layout="tile"
          className="h-full w-full"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {reorderable && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none rounded p-0.5 text-white active:cursor-grabbing"
              aria-label={`Reorder ${managedFile.file.name}`}
            >
              <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <FileInputActions
            managedFile={managedFile}
            className="ml-auto [&_button]:text-white [&_button:hover]:text-white"
          />
        </div>
        {(managedFile.status === "uploading" ||
          managedFile.status === "error") && (
          <div className="absolute inset-x-1 bottom-1">
            <FileInputProgress managedFile={managedFile} />
          </div>
        )}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pl-1 pr-2 text-xs",
          className,
        )}
      >
        {dragHandle}
        <span className="max-w-40 truncate">{managedFile.file.name}</span>
        <FileInputActions managedFile={managedFile} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-background p-2",
        className,
      )}
    >
      {dragHandle}

      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        <FileInputPreview
          managedFile={managedFile}
          fileType={fileType}
          layout="tile"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className="truncate text-sm font-medium text-foreground"
            title={managedFile.file.name}
          >
            {managedFile.file.name}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatBytes(managedFile.file.size)}
          </span>
        </div>
        <FileInputProgress managedFile={managedFile} />
      </div>

      <FileInputActions managedFile={managedFile} className="shrink-0" />
    </div>
  );
}
