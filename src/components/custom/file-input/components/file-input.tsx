"use client";

import * as React from "react";
import { FileInputRoot, type FileInputRootProps } from "./file-input-root";
import type {
  FileInputCommonProps,
  FileInputFileType,
  FileInputValueType,
  VariantFor,
} from "../types/file-input";

export type FileInputComponentProps<
  T extends FileInputFileType,
  V extends FileInputValueType = "binary",
  Variant extends VariantFor<T> = VariantFor<T>,
> = FileInputCommonProps<V, Variant> & {
  fileType: T;
  variant?: Variant;
  /** Item layout for the selected-files list. Defaults to "list". */
  layout?: "list" | "grid" | "compact";
};

/**
 * ARCHITECTURE NOTE
 * ------------------
 * This is the only file consumers should import from directly. It's
 * generic over three parameters, all inferred from the JSX call site
 * itself — `T` (fileType), `V` (valueType), and `Variant` (the literal
 * `variant` string):
 *
 *   <FileInput fileType="image" variant="multiple" valueType="base64"
 *              onChange={(value) => ...} />
 *   // value: Base64FilePayload[]
 *
 *   <FileInput fileType="document" onChange={(value) => ...} />
 *   // value: File | null   (defaults: variant="single", valueType="binary")
 *
 * Threading `Variant` as its own generic (rather than leaving it fixed to
 * the full per-fileType union, as the shared FileInputProps<V> union type
 * does) is what makes `onChange`'s value collapse to exactly `T | null` or
 * `T[]` instead of a wider `T | T[] | null`. The internal implementation
 * (FileInputRoot and below) stays non-generic — the runtime logic doesn't
 * change based on these type parameters, only the static type does.
 */
export function FileInput<
  T extends FileInputFileType,
  V extends FileInputValueType = "binary",
  Variant extends VariantFor<T> = VariantFor<T>,
>(props: FileInputComponentProps<T, V, Variant>) {
  return <FileInputRoot {...(props as unknown as FileInputRootProps)} />;
}
