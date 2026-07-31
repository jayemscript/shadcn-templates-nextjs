"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type SingleVideoViewProps<V extends FileInputValueType = "binary"> =
  Omit<FileInputComponentProps<"video", V, "single">, "fileType" | "variant">;

export function SingleVideoView<V extends FileInputValueType = "binary">(
  props: SingleVideoViewProps<V>,
) {
  return <FileInput {...props} fileType="video" variant="single" />;
}
