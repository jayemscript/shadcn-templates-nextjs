"use client";

import * as React from "react";
import {
  File as FileIcon,
  FileText,
  Film,
  ImageIcon,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileInputFileType, ManagedFile } from "../types/file-input";
import { formatBytes } from "../utils/file-size";

export interface FileInputPreviewProps {
  managedFile: ManagedFile;
  fileType: FileInputFileType;
  /** Layout hint — "tile" for grid/avatar/cover thumbnails, "row" for list items. */
  layout?: "tile" | "row";
  className?: string;
}

const FALLBACK_ICON: Record<FileInputFileType, React.ReactNode> = {
  image: <ImageIcon className="h-5 w-5" aria-hidden="true" />,
  document: <FileText className="h-5 w-5" aria-hidden="true" />,
  audio: <Music className="h-5 w-5" aria-hidden="true" />,
  video: <Film className="h-5 w-5" aria-hidden="true" />,
};

function FileCard({ managedFile, fileType, className }: FileInputPreviewProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-muted-foreground",
        className,
      )}
    >
      <span className="shrink-0">
        {FALLBACK_ICON[fileType] ?? (
          <FileIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </span>
      <span
        className="min-w-0 flex-1 truncate text-xs text-foreground"
        title={managedFile.file.name}
      >
        {managedFile.file.name}
      </span>
      <span className="shrink-0 text-[11px] tabular-nums">
        {formatBytes(managedFile.file.size)}
      </span>
    </div>
  );
}

export function FileInputPreview({
  managedFile,
  fileType,
  layout = "row",
  className,
}: FileInputPreviewProps) {
  const { previewKind, previewUrl, file } = managedFile;

  if (previewKind === "image" && previewUrl) {
    return (
      <img
        src={previewUrl}
        alt={file.name}
        className={cn(
          "h-full w-full object-cover",
          layout === "tile" ? "rounded-md" : "h-12 w-12 rounded-md",
          className,
        )}
      />
    );
  }

  if (previewKind === "video" && previewUrl) {
    return (
      <video
        src={previewUrl}
        muted
        playsInline
        className={cn(
          "h-full w-full object-cover",
          layout === "tile" ? "rounded-md" : "h-12 w-12 rounded-md",
          className,
        )}
      />
    );
  }

  if (previewKind === "audio" && previewUrl) {
    return (
      <div className={cn("flex w-full flex-col gap-1", className)}>
        <FileCard managedFile={managedFile} fileType={fileType} />
        <audio src={previewUrl} controls className="h-8 w-full" />
      </div>
    );
  }

  // TIFF/RAW images, documents, and any file without a browser-renderable
  // preview all fall back to the generic file card.
  return (
    <FileCard
      managedFile={managedFile}
      fileType={fileType}
      className={className}
    />
  );
}
