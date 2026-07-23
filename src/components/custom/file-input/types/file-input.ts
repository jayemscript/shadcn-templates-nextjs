import type { ReactNode } from "react";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * `FileInputProps` is a discriminated union keyed on `fileType`. Each branch
 * pins down its own `variant` union (e.g. "image" -> "avatar" | "cover-photo"
 * is valid, but "document" -> "avatar" is a type error). The `variant` is
 * additionally threaded into `FileInputCommonProps` so that `onChange`'s
 * `value` argument is typed as an array for "multiple" and as a single
 * nullable payload for "single" | "avatar" | "cover-photo".
 */

export type FileInputFileType = "image" | "document" | "audio" | "video";
export type FileInputValueType = "base64" | "binary";

export type ImageVariant = "single" | "multiple" | "avatar" | "cover-photo";
export type DocumentVariant = "single" | "multiple";
export type AudioVariant = "single" | "multiple";
export type VideoVariant = "single" | "multiple";

export type AnyVariant =
  | ImageVariant
  | DocumentVariant
  | AudioVariant
  | VideoVariant;

/** Variants that hold at most one file. */
export type SingleVariant = "single" | "avatar" | "cover-photo";
/** Variants that hold zero or more files. */
export type MultiVariant = "multiple";

/** Resolves the valid variant union for a given fileType. */
export type VariantFor<T extends FileInputFileType> = T extends "image"
  ? ImageVariant
  : T extends "document"
    ? DocumentVariant
    : T extends "audio"
      ? AudioVariant
      : T extends "video"
        ? VideoVariant
        : never;

/** Raw JSON-friendly payload produced when `valueType="base64"`. */
export interface Base64FilePayload {
  name: string;
  type: string;
  size: number;
  base64: string;
  dataUrl?: string;
}

/** Raw payload produced when `valueType="binary"` — the original File. */
export type BinaryFilePayload = File;

export type FilePayload<V extends FileInputValueType> = V extends "base64"
  ? Base64FilePayload
  : BinaryFilePayload;

/** Shape of the value handed to `onChange`, based on valueType + variant. */
export type FileInputValue<
  V extends FileInputValueType,
  Variant extends string,
> = Variant extends MultiVariant
  ? Array<FilePayload<V>>
  : FilePayload<V> | null;

export type ManagedFileStatus =
  | "idle"
  | "pending"
  | "reading"
  | "uploading"
  | "success"
  | "error";

export type PreviewKind = "image" | "video" | "audio" | "none";

/**
 * Internal representation of a file tracked by the store. This is distinct
 * from the public payload types — it carries UI/runtime state (progress,
 * preview URL, error) alongside the raw `File`.
 */
export interface ManagedFile {
  id: string;
  file: File;
  previewUrl?: string;
  previewKind: PreviewKind;
  status: ManagedFileStatus;
  progress: number; // 0-100
  error: string | null;
  base64?: string;
  dataUrl?: string;
}

export interface FileFormatConfig {
  /** Lowercase extensions without the dot, e.g. "png", "pdf". */
  extensions: string[];
  /** Accepted MIME types, may include wildcards like "image/*". */
  mimeTypes: string[];
}

/** "all" accepts every format for the fileType; string/string[] restrict it. */
export type FormatOption = "all" | string | string[];

export type UploadHandler = (
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal,
) => Promise<void>;

export interface FileInputCommonProps<
  V extends FileInputValueType,
  Variant extends string,
> {
  /** Output shape for onChange payloads. Defaults to "binary". */
  valueType?: V;
  /** Max size per file, in bytes. */
  maxSize?: number;
  /** Max number of files (only meaningful for multi-file variants). */
  maxFiles?: number;
  /** Restrict accepted formats. Defaults to "all" for the given fileType. */
  format?: FormatOption;
  /** Enable drag-and-drop onto the dropzone. Defaults to true. */
  dragAndDrop?: boolean;
  /** Enable drag-to-reorder for multi-file variants. Defaults to false. */
  reorderable?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  /** Custom per-file validation, run after built-in size/format checks. */
  validate?: (file: File) => string | null | Promise<string | null>;
  onChange?: (value: FileInputValue<V, Variant>, files: File[]) => void;
  onProgress?: (progress: number, file: File) => void;
  onError?: (error: string, file?: File) => void;

  /** Controlled mode: fully owns the file list. */
  value?: File[];
  /** Uncontrolled mode: seeds initial files. */
  defaultValue?: File[];

  /**
   * Backend-agnostic upload function. Selection and upload are decoupled —
   * if omitted, files are only selected/validated/previewed, never uploaded.
   */
  uploadHandler?: UploadHandler;
  /** Automatically invoke uploadHandler as soon as a file is accepted. */
  autoUpload?: boolean;

  /** Accessible label for the dropzone / input. */
  label?: string;
  /** Optional id, forwarded to the underlying <input>. Auto-generated if omitted. */
  id?: string;
}

export type FileInputProps<V extends FileInputValueType = FileInputValueType> =
  | ({ fileType: "image"; variant?: ImageVariant } & FileInputCommonProps<
      V,
      ImageVariant
    >)
  | ({ fileType: "document"; variant?: DocumentVariant } & FileInputCommonProps<
      V,
      DocumentVariant
    >)
  | ({ fileType: "audio"; variant?: AudioVariant } & FileInputCommonProps<
      V,
      AudioVariant
    >)
  | ({ fileType: "video"; variant?: VideoVariant } & FileInputCommonProps<
      V,
      VideoVariant
    >);

/** Narrowed props actually consumed by internal components (variant always resolved). */
export interface ResolvedFileInputConfig {
  fileType: FileInputFileType;
  variant: AnyVariant;
  isMulti: boolean;
  valueType: FileInputValueType;
  maxSize: number;
  maxFiles: number;
  format: FormatOption;
  dragAndDrop: boolean;
  reorderable: boolean;
  disabled: boolean;
  autoUpload: boolean;
}
