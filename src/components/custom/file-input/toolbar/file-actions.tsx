import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useFileInputContext,
  useFileInputFiles,
} from "../hooks/use-file-input";

export interface FileActionsToolbarProps {
  className?: string;
}

/**
 * Bulk toolbar shown above the file list for multi-file variants only —
 * per-file actions (remove/replace/retry) live in
 * components/file-input-actions.tsx instead, rendered inside each item.
 */
export function FileActionsToolbar({ className }: FileActionsToolbarProps) {
  const { config, clearFiles } = useFileInputContext();
  const files = useFileInputFiles();

  if (!config.isMulti || files.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-1 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <span>
        {files.length}
        {config.maxFiles ? ` / ${config.maxFiles}` : ""} file
        {files.length === 1 ? "" : "s"} selected
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={clearFiles}
        disabled={config.disabled}
        className="h-7 gap-1 px-2 text-xs"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Clear all
      </Button>
    </div>
  );
}
