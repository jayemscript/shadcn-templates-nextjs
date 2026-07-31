"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type SingleImageViewProps<V extends FileInputValueType = "binary"> =
  Omit<FileInputComponentProps<"image", V, "single">, "fileType" | "variant">;

export function SingleImageView<V extends FileInputValueType = "binary">(
  props: SingleImageViewProps<V>,
) {
  return <FileInput {...props} fileType="image" variant="single" />;
}
