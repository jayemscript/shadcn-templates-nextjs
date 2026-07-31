"use client";

import * as React from "react";
import { useStore } from "zustand";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileInputContext, useFileInput } from "../../hooks/use-file-input";
import type { FileInputComponentProps } from "../../components/file-input";
import type {
  FileInputProps,
  FileInputValueType,
} from "../../types/file-input";
import {
  buildAcceptString,
  resolveFormatConfig,
} from "../../utils/file-formats";

export type CoverPhotoViewProps<V extends FileInputValueType = "binary"> = Omit<
  FileInputComponentProps<"image", V, "cover-photo">,
  "fileType" | "variant" | "layout"
> & {
  /** CSS aspect-ratio value, e.g. "21/9" or "3/1". Defaults to "3/1". */
  aspectRatio?: string;
};

/** Same rationale as AvatarView: a bespoke banner layout on top of the shared hook/context. */
export function CoverPhotoView<V extends FileInputValueType = "binary">(
  props: CoverPhotoViewProps<V>,
) {
  const { aspectRatio = "3/1", className, label, ...rest } = props;
  const fullProps = {
    ...rest,
    fileType: "image",
    variant: "cover-photo",
  } as unknown as FileInputProps;
  const ctx = useFileInput(fullProps);
  const files = useStore(ctx.storeApi, (s) => s.files);
  const file = files[0];
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const dragCounter = React.useRef(0);

  const accept = React.useMemo(
    () => buildAcceptString(resolveFormatConfig("image", ctx.config.format)),
    [ctx.config.format],
  );

  const openPicker = () => {
    if (ctx.config.disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (selected) void ctx.addFiles([selected]);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!ctx.config.dragAndDrop || ctx.config.disabled) return;
    event.preventDefault();
    dragCounter.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!ctx.config.dragAndDrop || ctx.config.disabled) return;
    event.preventDefault();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!ctx.config.dragAndDrop || ctx.config.disabled) return;
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!ctx.config.dragAndDrop || ctx.config.disabled) return;
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) void ctx.addFiles([dropped]);
  };

  return (
    <FileInputContext.Provider value={ctx}>
      <div
        role="button"
        tabIndex={ctx.config.disabled ? -1 : 0}
        aria-label={label ?? "Upload cover photo"}
        aria-disabled={ctx.config.disabled}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ aspectRatio }}
        className={cn(
          "group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !ctx.config.disabled && "hover:border-primary/50",
          isDragActive && "border-primary bg-primary/5",
          ctx.config.disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        {file?.previewUrl ? (
          <img
            src={file.previewUrl}
            alt="Cover photo preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
            <span className="text-sm">
              {label ?? "Click or drag to upload a cover photo"}
            </span>
          </div>
        )}

        {file?.previewUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1.5 text-sm font-medium text-white">
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              Change cover photo
            </span>
          </div>
        )}

        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ctx.removeFile(file.id);
            }}
            aria-label="Remove cover photo"
            disabled={ctx.config.disabled}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        <input
          ref={inputRef}
          id={ctx.inputId}
          type="file"
          accept={accept}
          disabled={ctx.config.disabled}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </FileInputContext.Provider>
  );
}
