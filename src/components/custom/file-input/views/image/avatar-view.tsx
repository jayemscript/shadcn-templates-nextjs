"use client";

import * as React from "react";
import { useStore } from "zustand";
import { Camera, X } from "lucide-react";
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

export type AvatarViewProps<V extends FileInputValueType = "binary"> = Omit<
  FileInputComponentProps<"image", V, "avatar">,
  "fileType" | "variant" | "layout"
> & {
  /** Diameter in pixels. Defaults to 96. */
  size?: number;
};

/**
 * Avatar has a bespoke circular layout that doesn't fit the generic
 * dropzone+list composition FileInputRoot provides, so this view calls
 * useFileInput() directly and builds its own UI on top of the same
 * context/store — it still fully participates in validation, previews,
 * and upload the same way every other view does. Drag-and-drop is
 * intentionally not wired up here (click-to-upload only); the circular
 * target is small enough that drag targeting adds little value.
 */
export function AvatarView<V extends FileInputValueType = "binary">(
  props: AvatarViewProps<V>,
) {
  const { size = 96, className, label, ...rest } = props;
  const fullProps = {
    ...rest,
    fileType: "image",
    variant: "avatar",
  } as unknown as FileInputProps;
  const ctx = useFileInput(fullProps);
  const files = useStore(ctx.storeApi, (s) => s.files);
  const file = files[0];
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <FileInputContext.Provider value={ctx}>
      <div
        className={cn("relative inline-flex", className)}
        style={{ width: size, height: size }}
      >
        <button
          type="button"
          onClick={openPicker}
          aria-label={label ?? "Upload avatar"}
          disabled={ctx.config.disabled}
          className="group relative h-full w-full overflow-hidden rounded-full border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {file?.previewUrl ? (
            <img
              src={file.previewUrl}
              alt="Avatar preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Camera className="h-1/3 w-1/3" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-1/4 w-1/4 text-white" aria-hidden="true" />
          </div>
        </button>

        {file && (
          <button
            type="button"
            onClick={() => ctx.removeFile(file.id)}
            aria-label="Remove avatar"
            disabled={ctx.config.disabled}
            className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
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
