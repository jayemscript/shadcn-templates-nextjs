"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type MultipleImageViewProps<V extends FileInputValueType = "binary"> =
  Omit<FileInputComponentProps<"image", V, "multiple">, "fileType" | "variant">;

export function MultipleImageView<V extends FileInputValueType = "binary">(
  props: MultipleImageViewProps<V>,
) {
  const { layout = "grid", reorderable = true, ...rest } = props;
  return (
    <FileInput
      {...rest}
      fileType="image"
      variant="multiple"
      layout={layout}
      reorderable={reorderable}
    />
  );
}
