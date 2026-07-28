"use client";

import * as React from "react";
import { useStore } from "zustand";
import { cn } from "@/lib/utils";
import { FileInputContext, useFileInput } from "../hooks/use-file-input";
import type { FileInputProps } from "../types/file-input";
import { FileInputDropzone } from "./file-input-dropzone";
import { FileInputList } from "./file-input-list";
import { FileActionsToolbar } from "../toolbar/file-actions";
import { ErrorState } from "../toolbar/error-state";

export type FileInputRootProps = FileInputProps & {
  /** Item layout for the selected-files list. Defaults to "list". */
  layout?: "list" | "grid" | "compact";
};

/**
 * ARCHITECTURE NOTE
 * ------------------
 * FileInputRoot is the only place useFileInput() is called, and the only
 * place FileInputContext.Provider is rendered. Everything below it
 * (dropzone, toolbar, list, items) is a pure context consumer, which is
 * what lets multiple <FileInputRoot> trees coexist on one page without
 * cross-talk — each gets its own store instance.
 */
export function FileInputRoot(props: FileInputRootProps) {
  const { layout = "list", className, label, ...rest } = props;
  const ctx = useFileInput(rest as FileInputProps);
  const globalError = useStore(ctx.storeApi, (s) => s.globalError);
  const files = useStore(ctx.storeApi, (s) => s.files);

  const showDropzone = ctx.config.isMulti
    ? files.length < ctx.config.maxFiles
    : files.length === 0;

  return (
    <FileInputContext.Provider value={ctx}>
      <div className={cn("space-y-2", className)}>
        {globalError && (
          <ErrorState
            message={globalError}
            onDismiss={() => ctx.storeApi.getState().setGlobalError(null)}
          />
        )}

        {showDropzone && <FileInputDropzone label={label} />}

        <FileActionsToolbar />

        <FileInputList layout={layout} />
      </div>
    </FileInputContext.Provider>
  );
}
