"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type MultipleAudioViewProps<V extends FileInputValueType = "binary"> =
  Omit<FileInputComponentProps<"audio", V, "multiple">, "fileType" | "variant">;

export function MultipleAudioView<V extends FileInputValueType = "binary">(
  props: MultipleAudioViewProps<V>,
) {
  const { layout = "list", reorderable = true, ...rest } = props;
  return (
    <FileInput
      {...rest}
      fileType="audio"
      variant="multiple"
      layout={layout}
      reorderable={reorderable}
    />
  );
}
