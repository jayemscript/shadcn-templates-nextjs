import type {
  FileFormatConfig,
  FileInputFileType,
  FormatOption,
} from "../types/file-input";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * Each fileType has a default "all formats" config used when `format="all"`
 * (the default). When the consumer passes a string or string[] via `format`,
 * we treat each entry as either a bare extension ("pdf"), a dotted extension
 * (".pdf"), or a full/partial MIME type ("image/png", "image/*").
 */

export const IMAGE_FORMATS: FileFormatConfig = {
  extensions: [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "tif",
    "tiff",
    "raw",
    "arw",
    "cr2",
    "nef",
    "dng",
  ],
  mimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/tiff",
    "image/x-adobe-dng",
    "image/x-canon-cr2",
    "image/x-nikon-nef",
    "image/x-sony-arw",
    // RAW formats are frequently served with no/octet-stream MIME type by
    // OS file pickers, so extension matching is the primary guard for them.
    "application/octet-stream",
  ],
};

export const DOCUMENT_FORMATS: FileFormatConfig = {
  extensions: ["pdf", "doc", "docx", "csv", "xls", "xlsx", "txt", "md"],
  mimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/markdown",
  ],
};

export const AUDIO_FORMATS: FileFormatConfig = {
  extensions: ["mp3", "wav", "ogg", "m4a", "aac", "flac", "webm"],
  mimeTypes: [
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/mp4",
    "audio/aac",
    "audio/flac",
    "audio/webm",
  ],
};

export const VIDEO_FORMATS: FileFormatConfig = {
  extensions: ["mp4", "webm", "mov", "avi", "mkv", "m4v"],
  mimeTypes: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ],
};

export const DEFAULT_FORMATS: Record<FileInputFileType, FileFormatConfig> = {
  image: IMAGE_FORMATS,
  document: DOCUMENT_FORMATS,
  audio: AUDIO_FORMATS,
  video: VIDEO_FORMATS,
};

/** Images that browsers generally cannot render via <img>/object URLs. */
export const NON_PREVIEWABLE_IMAGE_EXTENSIONS = new Set([
  "tif",
  "tiff",
  "raw",
  "arw",
  "cr2",
  "nef",
  "dng",
]);

export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1 || idx === fileName.length - 1) return "";
  return fileName.slice(idx + 1).toLowerCase();
}

function normalizeFormatEntry(entry: string): string {
  return entry.trim().toLowerCase().replace(/^\./, "");
}

/**
 * Resolves a `format` prop (which may be "all", a single string, or an
 * array) into a concrete FileFormatConfig for a given fileType. Custom
 * entries are merged onto the default config, restricting to just the
 * entries the consumer specified.
 */
export function resolveFormatConfig(
  fileType: FileInputFileType,
  format: FormatOption | undefined,
): FileFormatConfig {
  const defaults = DEFAULT_FORMATS[fileType];
  if (!format || format === "all") return defaults;

  const entries = (Array.isArray(format) ? format : [format]).map(
    normalizeFormatEntry,
  );
  const extensions: string[] = [];
  const mimeTypes: string[] = [];

  for (const entry of entries) {
    if (entry.includes("/")) {
      mimeTypes.push(entry);
    } else {
      extensions.push(entry);
    }
  }

  return {
    extensions: extensions.length > 0 ? extensions : defaults.extensions,
    mimeTypes: mimeTypes.length > 0 ? mimeTypes : defaults.mimeTypes,
  };
}

/** Builds an HTML `accept` attribute string from a resolved format config. */
export function buildAcceptString(config: FileFormatConfig): string {
  const exts = config.extensions.map((ext) => `.${ext}`);
  const mimes = config.mimeTypes.filter(
    (m) => m !== "application/octet-stream",
  );
  return Array.from(new Set([...exts, ...mimes])).join(",");
}

/** Checks whether a File matches a resolved format config, by ext or MIME. */
export function matchesFormat(file: File, config: FileFormatConfig): boolean {
  const ext = getFileExtension(file.name);
  if (ext && config.extensions.includes(ext)) return true;

  const type = file.type.toLowerCase();
  if (!type) return false;

  return config.mimeTypes.some((mime) => {
    if (mime.endsWith("/*")) {
      return type.startsWith(mime.slice(0, -1));
    }
    return type === mime;
  });
}

export function isNonPreviewableImage(fileName: string): boolean {
  return NON_PREVIEWABLE_IMAGE_EXTENSIONS.has(getFileExtension(fileName));
}
