import type { FileInputFileType, PreviewKind } from "../types/file-input";
import { isNonPreviewableImage } from "./file-formats";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * Object URLs are the cheapest way to preview local Files (no FileReader
 * round-trip needed for images/video/audio). They must be explicitly
 * revoked or they leak memory for the lifetime of the page — the store
 * (not this module) owns *when* to revoke, but the creation/revocation
 * primitives live here so that logic isn't duplicated.
 */

/**
 * Determines what kind of native preview element (if any) applies to a
 * file, based on the configured fileType and the file's own name/type.
 * TIFF/RAW images are intentionally excluded — most browsers can't decode
 * them via <img>, so callers should fall back to a generic file card.
 */
export function getPreviewKind(
  file: File,
  fileType: FileInputFileType,
): PreviewKind {
  if (fileType === "image") {
    if (isNonPreviewableImage(file.name)) return "none";
    return "image";
  }
  if (fileType === "video") return "video";
  if (fileType === "audio") return "audio";
  return "none";
}

export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string | undefined): void {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    // Already revoked or invalid — safe to ignore.
  }
}

/** Revokes a whole batch of preview URLs, skipping empty/undefined entries. */
export function revokeObjectUrls(urls: Array<string | undefined>): void {
  for (const url of urls) revokeObjectUrl(url);
}
