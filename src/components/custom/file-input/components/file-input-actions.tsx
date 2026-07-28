"use client";

import * as React from "react";
import { RefreshCw, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFileInputContext } from "../hooks/use-file-input";
import type { ManagedFile } from "../types/file-input";
import { buildAcceptString, resolveFormatConfig } from "../utils/file-formats";

export interface FileInputActionsProps {
  managedFile: ManagedFile;
  className?: string;
}

export function FileInputActions({
  managedFile,
  className,
}: FileInputActionsProps) {
  const { config, removeFile, replaceFile, retryFile } = useFileInputContext();
  const replaceInputRef = React.useRef<HTMLInputElement>(null);

  const accept = React.useMemo(
    () =>
      buildAcceptString(resolveFormatConfig(config.fileType, config.format)),
    [config.fileType, config.format],
  );

  const handleReplaceClick = () => {
    if (config.disabled) return;
    replaceInputRef.current?.click();
  };

  const handleReplaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void replaceFile(managedFile.id, file);
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {managedFile.status === "error" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={config.disabled}
          onClick={() => retryFile(managedFile.id)}
          aria-label={`Retry uploading ${managedFile.file.name}`}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        disabled={config.disabled}
        onClick={handleReplaceClick}
        aria-label={`Replace ${managedFile.file.name}`}
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <input
        ref={replaceInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleReplaceChange}
        tabIndex={-1}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive"
        disabled={config.disabled}
        onClick={() => removeFile(managedFile.id)}
        aria-label={`Remove ${managedFile.file.name}`}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
