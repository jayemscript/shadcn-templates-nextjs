"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ManagedFile } from "../types/file-input";

export interface FileInputProgressProps {
  managedFile: ManagedFile;
  className?: string;
}

export function FileInputProgress({
  managedFile,
  className,
}: FileInputProgressProps) {
  const { status, progress, error } = managedFile;

  if (status === "idle" || status === "pending") return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {(status === "uploading" || status === "reading") && (
        <Loader2
          className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      )}
      {status === "success" && (
        <CheckCircle2
          className="h-3.5 w-3.5 shrink-0 text-emerald-500"
          aria-hidden="true"
        />
      )}
      {status === "error" && (
        <AlertCircle
          className="h-3.5 w-3.5 shrink-0 text-destructive"
          aria-hidden="true"
        />
      )}

      {(status === "uploading" || status === "reading") && (
        <Progress
          value={progress}
          className="h-1.5 flex-1"
          aria-label="Upload progress"
        />
      )}

      {status === "error" && error && (
        <span className="truncate text-xs text-destructive" title={error}>
          {error}
        </span>
      )}

      {status === "success" && (
        <span className="text-xs text-muted-foreground">Done</span>
      )}
    </div>
  );
}
