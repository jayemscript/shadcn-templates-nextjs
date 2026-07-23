"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileInputFileType } from "../types/file-input";

export interface EmptyStateProps {
  fileType: FileInputFileType;
  dragAndDrop: boolean;
  isDragActive: boolean;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
}

const FILE_TYPE_LABEL: Record<FileInputFileType, string> = {
  image: "images",
  document: "documents",
  audio: "audio files",
  video: "videos",
};

export function EmptyState({
  fileType,
  dragAndDrop,
  isDragActive,
  icon,
  label,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-8 text-center transition-colors",
        isDragActive && "text-primary",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors",
          isDragActive && "bg-primary/10 text-primary",
        )}
      >
        {icon ?? <UploadCloud className="h-5 w-5" aria-hidden="true" />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {label ?? `Upload ${FILE_TYPE_LABEL[fileType]}`}
        </p>
        <p className="text-xs text-muted-foreground">
          {dragAndDrop
            ? "Drag and drop, or click to browse"
            : "Click to browse"}
        </p>
      </div>
    </div>
  );
}
