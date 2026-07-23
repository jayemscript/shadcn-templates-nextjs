import { useCallback, useRef } from "react";
import type { ManagedFile, UploadHandler } from "../types/file-input";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * Selection and upload are deliberately decoupled: this hook does nothing
 * unless the consumer supplies `uploadHandler` (backend-agnostic — could be
 * fetch/XHR/presigned-URL/whatever). Retry is just calling `upload` again
 * with the same id/file; abort is per-file via AbortController so one slow
 * upload can be cancelled without affecting siblings.
 */

export interface UseFileUploadParams {
  uploadHandler?: UploadHandler;
  updateFile: (id: string, patch: Partial<ManagedFile>) => void;
  onProgress?: (progress: number, file: File) => void;
  onError?: (error: string, file?: File) => void;
}

export interface UseFileUploadResult {
  upload: (id: string, file: File) => Promise<void>;
  abort: (id: string) => void;
  abortAll: () => void;
}

export function useFileUpload(
  params: UseFileUploadParams,
): UseFileUploadResult {
  const { uploadHandler, updateFile, onProgress, onError } = params;
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  const upload = useCallback(
    async (id: string, file: File) => {
      if (!uploadHandler) return;

      controllersRef.current.get(id)?.abort();
      const controller = new AbortController();
      controllersRef.current.set(id, controller);

      updateFile(id, { status: "uploading", progress: 0, error: null });

      try {
        await uploadHandler(
          file,
          (percent) => {
            const clamped = Math.max(0, Math.min(100, percent));
            updateFile(id, { progress: clamped });
            onProgress?.(clamped, file);
          },
          controller.signal,
        );

        if (controller.signal.aborted) return;
        updateFile(id, { status: "success", progress: 100 });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Upload failed.";
        updateFile(id, { status: "error", error: message });
        onError?.(message, file);
      } finally {
        controllersRef.current.delete(id);
      }
    },
    [uploadHandler, updateFile, onProgress, onError],
  );

  const abort = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
  }, []);

  const abortAll = useCallback(() => {
    for (const controller of controllersRef.current.values())
      controller.abort();
    controllersRef.current.clear();
  }, []);

  return { upload, abort, abortAll };
}
