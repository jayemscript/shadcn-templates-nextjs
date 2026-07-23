"use client";

import { useCallback } from "react";
import type { FileInputFileType, FormatOption } from "../types/file-input";
import {
  validateFiles,
  type BatchValidationResult,
} from "../utils/file-validation";

export interface UseFileValidationOptions {
  fileType: FileInputFileType;
  format?: FormatOption;
  maxSize?: number;
  maxFiles?: number;
  validate?: (file: File) => string | null | Promise<string | null>;
}

/**
 * Thin, memoized React wrapper around `validateFiles`. Kept separate from
 * `use-file-input.ts` so validation logic can be unit-tested or reused
 * (e.g. for pre-validating a batch dropped outside the component) without
 * pulling in store wiring.
 */
export function useFileValidation(options: UseFileValidationOptions) {
  const { fileType, format, maxSize, maxFiles, validate } = options;

  const validateBatch = useCallback(
    (files: File[], currentCount: number): Promise<BatchValidationResult> => {
      return validateFiles(files, {
        fileType,
        format,
        maxSize,
        maxFiles,
        currentCount,
        validate,
      });
    },
    [fileType, format, maxSize, maxFiles, validate],
  );

  return { validateBatch };
}
