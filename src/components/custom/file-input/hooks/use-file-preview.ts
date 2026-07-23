"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import type {
  FileInputFileType,
  FileInputProps,
  FileInputValueType,
  ManagedFile,
  ResolvedFileInputConfig,
} from "../types/file-input";
import {
  createFileInputStore,
  type FileInputStoreApi,
} from "../store/file-input.store";
import { useFileValidation } from "./use-file-validation";
import { useFileUpload } from "./use-file-upload";
import {
  createObjectUrl,
  getPreviewKind,
  revokeObjectUrl,
} from "../utils/file-preview";
import {
  filesToBase64Payloads,
  filesToBinaryPayloads,
} from "../utils/file-serialization";
import { DEFAULT_MAX_SIZE_BYTES } from "../utils/file-size";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * `useFileInput` is called exactly once, in <FileInputRoot>. It creates one
 * store instance (via useState's lazy initializer, so it survives
 * re-renders but a fresh instance is made per mount) and returns a context
 * value that FileInputRoot provides to the rest of the subtree. Descendant
 * components never call useFileInput themselves — they read from context
 * via useFileInputContext()/useFileInputFiles(), which is what keeps
 * multiple <FileInput> instances on one page fully isolated.
 */

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function resolveConfig(props: FileInputProps): ResolvedFileInputConfig {
  const variant = props.variant ?? "single";
  const isMulti = variant === "multiple";

  return {
    fileType: props.fileType,
    variant,
    isMulti,
    valueType: (props.valueType ?? "binary") as FileInputValueType,
    maxSize: props.maxSize ?? DEFAULT_MAX_SIZE_BYTES,
    maxFiles: props.maxFiles ?? (isMulti ? 10 : 1),
    format: props.format ?? "all",
    dragAndDrop: props.dragAndDrop ?? true,
    reorderable: props.reorderable ?? false,
    disabled: props.disabled ?? false,
    autoUpload: props.autoUpload ?? false,
  };
}

function toManagedFile(file: File, fileType: FileInputFileType): ManagedFile {
  const previewKind = getPreviewKind(file, fileType);
  return {
    id: generateId(),
    file,
    previewKind,
    previewUrl: previewKind === "none" ? undefined : createObjectUrl(file),
    status: "idle",
    progress: 0,
    error: null,
  };
}

export interface FileInputContextValue {
  storeApi: FileInputStoreApi;
  config: ResolvedFileInputConfig;
  inputId: string;
  icon: ReactNode | undefined;
  addFiles: (input: FileList | File[]) => Promise<void>;
  removeFile: (id: string) => void;
  replaceFile: (id: string, file: File) => Promise<void>;
  retryFile: (id: string) => void;
  clearFiles: () => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  abortUpload: (id: string) => void;
}

export const FileInputContext = createContext<FileInputContextValue | null>(
  null,
);

export function useFileInputContext(): FileInputContextValue {
  const ctx = useContext(FileInputContext);
  if (!ctx) {
    throw new Error(
      "File input subcomponents must be rendered within <FileInputRoot>.",
    );
  }
  return ctx;
}

export function useFileInputFiles(): ManagedFile[] {
  const { storeApi } = useFileInputContext();
  return useStore(storeApi, (s) => s.files);
}

export function useFileInputGlobalError(): string | null {
  const { storeApi } = useFileInputContext();
  return useStore(storeApi, (s) => s.globalError);
}

export function useFileInput(props: FileInputProps): FileInputContextValue {
  const config = useMemo(
    () => resolveConfig(props),
    [
      props.fileType,
      props.variant,
      props.valueType,
      props.maxSize,
      props.maxFiles,
      props.format,
      props.dragAndDrop,
      props.reorderable,
      props.disabled,
      props.autoUpload,
    ],
  );

  const generatedId = useId();
  const inputId = props.id ?? generatedId;

  const [storeApi] = useState<FileInputStoreApi>(() =>
    createFileInputStore(
      (props.defaultValue ?? []).map((f) => toManagedFile(f, config.fileType)),
    ),
  );

  const { validateBatch } = useFileValidation({
    fileType: config.fileType,
    format: config.format,
    maxSize: config.maxSize,
    maxFiles: config.maxFiles,
    validate: props.validate,
  });

  const updateFile = useCallback(
    (id: string, patch: Partial<ManagedFile>) =>
      storeApi.getState().updateFile(id, patch),
    [storeApi],
  );

  const { upload, abort, abortAll } = useFileUpload({
    uploadHandler: props.uploadHandler,
    updateFile,
    onProgress: props.onProgress,
    onError: props.onError,
  });

  const emitChange = useCallback(async () => {
    if (!props.onChange) return;
    const files = storeApi.getState().files;
    const rawFiles = files.map((f) => f.file);

    // The exact literal shape of `value` depends on runtime valueType/isMulti,
    // which TS can't statically correlate back to the generic `V` the
    // consumer's component instantiated FileInputProps<V> with. The public
    // component boundary (file-input.tsx) is what keeps callers type-safe;
    // this cast is an internal implementation detail.
    if (config.valueType === "binary") {
      const binaryPayloads = filesToBinaryPayloads(rawFiles);
      const value = config.isMulti
        ? binaryPayloads
        : (binaryPayloads[0] ?? null);
      (props.onChange as (value: unknown, files: File[]) => void)(
        value,
        rawFiles,
      );
      return;
    }

    const base64Payloads = await filesToBase64Payloads(rawFiles);
    const value = config.isMulti ? base64Payloads : (base64Payloads[0] ?? null);
    (props.onChange as (value: unknown, files: File[]) => void)(
      value,
      rawFiles,
    );
  }, [props.onChange, config.valueType, config.isMulti, storeApi]);

  const addFiles = useCallback(
    async (input: FileList | File[]) => {
      if (config.disabled) return;
      const incoming = Array.from(input);
      if (incoming.length === 0) return;

      const effectiveIncoming = config.isMulti
        ? incoming
        : incoming.slice(0, 1);
      const currentCount = config.isMulti
        ? storeApi.getState().files.length
        : 0;
      const { accepted, rejected } = await validateBatch(
        effectiveIncoming,
        currentCount,
      );

      for (const { file, error } of rejected) {
        props.onError?.(error, file);
      }
      if (rejected.length > 0) {
        storeApi
          .getState()
          .setGlobalError(rejected[rejected.length - 1]!.error);
      }
      if (accepted.length === 0) return;

      const newManaged = accepted.map((file) =>
        toManagedFile(file, config.fileType),
      );

      if (config.isMulti) {
        storeApi.getState().addFiles(newManaged);
      } else {
        for (const existing of storeApi.getState().files)
          revokeObjectUrl(existing.previewUrl);
        storeApi.getState().setFiles(newManaged);
      }

      await emitChange();

      if (config.autoUpload && props.uploadHandler) {
        for (const mf of newManaged) void upload(mf.id, mf.file);
      }
    },
    [
      config,
      storeApi,
      validateBatch,
      emitChange,
      upload,
      props.onError,
      props.uploadHandler,
    ],
  );

  const removeFile = useCallback(
    (id: string) => {
      abort(id);
      storeApi.getState().removeFile(id);
      void emitChange();
    },
    [abort, storeApi, emitChange],
  );

  const replaceFile = useCallback(
    async (id: string, file: File) => {
      const { accepted, rejected } = await validateBatch([file], 0);
      if (rejected.length > 0) {
        const err = rejected[0]!.error;
        props.onError?.(err, file);
        storeApi.getState().setGlobalError(err);
        return;
      }
      const [validFile] = accepted;
      if (!validFile) return;

      const next = toManagedFile(validFile, config.fileType);
      next.id = id;
      storeApi.getState().replaceFile(id, next);
      await emitChange();

      if (config.autoUpload && props.uploadHandler) void upload(id, validFile);
    },
    [
      validateBatch,
      storeApi,
      emitChange,
      config,
      upload,
      props.onError,
      props.uploadHandler,
    ],
  );

  const retryFile = useCallback(
    (id: string) => {
      const target = storeApi.getState().files.find((f) => f.id === id);
      if (!target) return;
      void upload(id, target.file);
    },
    [storeApi, upload],
  );

  const clearFiles = useCallback(() => {
    abortAll();
    storeApi.getState().clearFiles();
    void emitChange();
  }, [abortAll, storeApi, emitChange]);

  const reorderFiles = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!config.reorderable || !config.isMulti) return;
      storeApi.getState().reorderFiles(fromIndex, toIndex);
      void emitChange();
    },
    [config.reorderable, config.isMulti, storeApi, emitChange],
  );

  // Controlled-mode sync: rebuild the managed list whenever `props.value`
  // changes by reference, reusing existing ManagedFile entries (and their
  // previews) for File objects that are still present.
  useEffect(() => {
    if (props.value === undefined) return;
    const nextFiles = props.value;
    const currentManaged = storeApi.getState().files;

    const same =
      nextFiles.length === currentManaged.length &&
      nextFiles.every((f, i) => currentManaged[i]?.file === f);
    if (same) return;

    const nextSet = new Set(nextFiles);
    for (const mf of currentManaged) {
      if (!nextSet.has(mf.file)) revokeObjectUrl(mf.previewUrl);
    }

    const byFile = new Map(currentManaged.map((mf) => [mf.file, mf] as const));
    const nextManaged = nextFiles.map(
      (file) => byFile.get(file) ?? toManagedFile(file, config.fileType),
    );

    storeApi.getState().setFiles(nextManaged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value, storeApi, config.fileType]);

  // Revoke all previews and abort in-flight uploads when the whole input unmounts.
  useEffect(() => {
    return () => {
      abortAll();
      for (const mf of storeApi.getState().files)
        revokeObjectUrl(mf.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo<FileInputContextValue>(
    () => ({
      storeApi,
      config,
      inputId,
      icon: props.icon,
      addFiles,
      removeFile,
      replaceFile,
      retryFile,
      clearFiles,
      reorderFiles,
      abortUpload: abort,
    }),
    [
      storeApi,
      config,
      inputId,
      props.icon,
      addFiles,
      removeFile,
      replaceFile,
      retryFile,
      clearFiles,
      reorderFiles,
      abort,
    ],
  );
}
