"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFileInputContext } from "../hooks/use-file-input";
import { buildAcceptString, resolveFormatConfig } from "../utils/file-formats";
import { EmptyState } from "../toolbar/empty-state";

export interface FileInputDropzoneProps {
  label?: string;
  className?: string;
  /** Override the default EmptyState content entirely. */
  children?: React.ReactNode;
}

export function FileInputDropzone({
  label,
  className,
  children,
}: FileInputDropzoneProps) {
  const { config, inputId, icon, addFiles } = useFileInputContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const dragCounter = React.useRef(0);

  const accept = React.useMemo(
    () =>
      buildAcceptString(resolveFormatConfig(config.fileType, config.format)),
    [config.fileType, config.format],
  );

  const openPicker = () => {
    if (config.disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = "";
    if (files.length > 0) void addFiles(files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!config.dragAndDrop || config.disabled) return;
    event.preventDefault();
    dragCounter.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!config.dragAndDrop || config.disabled) return;
    event.preventDefault();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!config.dragAndDrop || config.disabled) return;
    event.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!config.dragAndDrop || config.disabled) return;
    event.preventDefault();
    dragCounter.current = 0;
    setIsDragActive(false);
    const fileList = event.dataTransfer.files;
    if (fileList && fileList.length > 0) void addFiles(fileList);
  };

  return (
    <div
      role="button"
      tabIndex={config.disabled ? -1 : 0}
      aria-disabled={config.disabled}
      aria-label={label ?? `Upload ${config.fileType}`}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "cursor-pointer rounded-lg border-2 border-dashed border-border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !config.disabled && "hover:border-primary/50 hover:bg-accent/30",
        isDragActive && "border-primary bg-primary/5",
        config.disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={config.isMulti}
        disabled={config.disabled}
        onChange={handleChange}
        onClick={(event) => event.stopPropagation()}
        className="hidden"
      />
      {children ?? (
        <EmptyState
          fileType={config.fileType}
          dragAndDrop={config.dragAndDrop}
          isDragActive={isDragActive}
          icon={icon}
          label={label}
        />
      )}
    </div>
  );
}
