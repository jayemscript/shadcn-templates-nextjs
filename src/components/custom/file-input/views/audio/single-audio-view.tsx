"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type SingleAudioViewProps<V extends FileInputValueType = "binary"> =
  Omit<FileInputComponentProps<"audio", V, "single">, "fileType" | "variant">;

export function SingleAudioView<V extends FileInputValueType = "binary">(
  props: SingleAudioViewProps<V>,
) {
  return <FileInput {...props} fileType="audio" variant="single" />;
}
