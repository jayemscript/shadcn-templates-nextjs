const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/**
 * Formats a byte count as a human-readable string, e.g. 1536 -> "1.5 KB".
 * Uses 1024-based units (KiB/MiB internally) but labels them KB/MB/GB to
 * match the labels most users expect in file pickers.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes === 0) return "0 B";

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    SIZE_UNITS.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = exponent === 0 ? value.toFixed(0) : value.toFixed(decimals);

  return `${rounded} ${SIZE_UNITS[exponent]}`;
}

/** Parses a human size string like "5MB" or "500 KB" into bytes. Returns null if unparseable. */
export function parseBytes(input: string): number | null {
  const match = /^([\d.]+)\s*(B|KB|MB|GB|TB)$/i.exec(input.trim());
  if (!match) return null;

  const [, numStr, unitStr] = match as unknown as [string, string, string];
  const num = Number.parseFloat(numStr);
  if (Number.isNaN(num)) return null;

  const unitIndex = SIZE_UNITS.findIndex(
    (u) => u.toLowerCase() === unitStr.toLowerCase(),
  );
  if (unitIndex === -1) return null;

  return Math.round(num * Math.pow(1024, unitIndex));
}

export function exceedsMaxSize(
  file: File,
  maxSize: number | undefined,
): boolean {
  if (!maxSize || maxSize <= 0) return false;
  return file.size > maxSize;
}

/** Default per-file max size fallback (10 MB) used when no maxSize is provided. */
export const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
