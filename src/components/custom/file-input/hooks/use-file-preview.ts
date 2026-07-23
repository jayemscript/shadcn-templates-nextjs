import { useEffect, useRef, useState } from "react";
import type { FileInputFileType, PreviewKind } from "../types/file-input";
import {
  createObjectUrl,
  getPreviewKind,
  revokeObjectUrl,
} from "../utils/file-preview";

export interface FilePreview {
  url: string | undefined;
  kind: PreviewKind;
}

/**
 * Creates (and automatically revokes) an object URL preview for a single
 * File. Revocation happens whenever `file` changes or the component
 * unmounts, so callers never need to manage the URL lifecycle by hand.
 */
export function useFilePreview(
  file: File | null | undefined,
  fileType: FileInputFileType,
): FilePreview {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const kind: PreviewKind = file ? getPreviewKind(file, fileType) : "none";

  useEffect(() => {
    if (!file || kind === "none") {
      setUrl(undefined);
      return;
    }

    const objectUrl = createObjectUrl(file);
    setUrl(objectUrl);

    return () => {
      revokeObjectUrl(objectUrl);
    };
  }, [file, kind]);

  return { url, kind };
}

/**
 * Batch variant for multi-file variants/views. Maintains a File -> preview
 * cache across renders, creating object URLs only for files it hasn't seen
 * yet and revoking ones for files that were removed from the list, rather
 * than tearing down and recreating every preview on every render.
 */
export function useFilePreviews(
  files: File[],
  fileType: FileInputFileType,
): Map<File, FilePreview> {
  const cacheRef = useRef<Map<File, FilePreview>>(new Map());
  const [, forceRender] = useState(0);

  useEffect(() => {
    const cache = cacheRef.current;
    const nextFiles = new Set(files);
    let changed = false;

    for (const [file, preview] of cache) {
      if (!nextFiles.has(file)) {
        revokeObjectUrl(preview.url);
        cache.delete(file);
        changed = true;
      }
    }

    for (const file of files) {
      if (!cache.has(file)) {
        const kind = getPreviewKind(file, fileType);
        const url = kind === "none" ? undefined : createObjectUrl(file);
        cache.set(file, { url, kind });
        changed = true;
      }
    }

    if (changed) forceRender((n) => n + 1);
  }, [files, fileType]);

  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      for (const preview of cache.values()) revokeObjectUrl(preview.url);
      cache.clear();
    };
  }, []);

  return cacheRef.current;
}
