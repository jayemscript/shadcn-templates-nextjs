"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type MultipleVideoViewProps<V extends FileInputValueType = "binary"> =
  Omit<FileInputComponentProps<"video", V, "multiple">, "fileType" | "variant">;

export function MultipleVideoView<V extends FileInputValueType = "binary">(
  props: MultipleVideoViewProps<V>,
) {
  const { layout = "list", reorderable = true, ...rest } = props;
  return (
    <FileInput
      {...rest}
      fileType="video"
      variant="multiple"
      layout={layout}
      reorderable={reorderable}
    />
  );
}
