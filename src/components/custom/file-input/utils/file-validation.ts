import type { FormatOption } from "../types/file-input";
import { resolveFormatConfig, matchesFormat } from "./file-formats";
import { exceedsMaxSize, formatBytes } from "./file-size";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * Validation is split into cheap synchronous checks (format, size, count)
 * run first, and an optional async `validate` callback run last so custom
 * logic (e.g. checking image dimensions, virus scanning stubs, etc.) only
 * fires on files that already passed the built-in checks.
 */

export interface ValidationContext {
  fileType: "image" | "document" | "audio" | "video";
  format?: FormatOption;
  maxSize?: number;
  maxFiles?: number;
  /** Number of files already accepted, before this batch. */
  currentCount: number;
  validate?: (file: File) => string | null | Promise<string | null>;
}

/**
 * `error` is always present (never optional/absent), typed `string | null`.
 * This deliberately avoids relying on discriminated-union narrowing of
 * `valid` to access `error` — some editors/linters and non-`tsc` type
 * checkers narrow less reliably, so a flat, always-present field sidesteps
 * that entirely: `result.error` is legal to read no matter what branch
 * produced the result.
 */
export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

function ok(): ValidationResult {
  return { valid: true, error: null };
}

function fail(error: string): ValidationResult {
  return { valid: false, error };
}

export async function validateFile(
  file: File,
  ctx: ValidationContext,
  indexInBatch: number,
): Promise<ValidationResult> {
  const formatConfig = resolveFormatConfig(ctx.fileType, ctx.format);
  if (!matchesFormat(file, formatConfig)) {
    return fail(`"${file.name}" has an unsupported format.`);
  }

  if (exceedsMaxSize(file, ctx.maxSize)) {
    return fail(
      `"${file.name}" exceeds the maximum size of ${formatBytes(ctx.maxSize ?? 0)}.`,
    );
  }

  if (typeof ctx.maxFiles === "number" && ctx.maxFiles > 0) {
    const totalAfter = ctx.currentCount + indexInBatch + 1;
    if (totalAfter > ctx.maxFiles) {
      return fail(
        `Only up to ${ctx.maxFiles} file${ctx.maxFiles === 1 ? "" : "s"} allowed.`,
      );
    }
  }

  if (ctx.validate) {
    const customError = await ctx.validate(file);
    if (customError) {
      return fail(customError);
    }
  }

  return ok();
}

export interface BatchValidationResult {
  accepted: File[];
  rejected: Array<{ file: File; error: string }>;
}

/**
 * Validates a batch of newly-selected files against the current context.
 * Runs sequentially (not in parallel) so the maxFiles count check accounts
 * for earlier files in the same batch as they're accepted.
 */
export async function validateFiles(
  files: File[],
  ctx: ValidationContext,
): Promise<BatchValidationResult> {
  const accepted: File[] = [];
  const rejected: Array<{ file: File; error: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const acceptedSoFar = accepted.length;
    const result = await validateFile(file, ctx, acceptedSoFar);
    if (result.valid) {
      accepted.push(file);
    } else {
      rejected.push({ file, error: result.error ?? "Invalid file." });
    }
  }

  return { accepted, rejected };
}
