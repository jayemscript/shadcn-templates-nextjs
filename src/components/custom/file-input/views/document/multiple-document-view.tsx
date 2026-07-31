"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type MultipleDocumentViewProps<V extends FileInputValueType = "binary"> =
  Omit<
    FileInputComponentProps<"document", V, "multiple">,
    "fileType" | "variant"
  >;

export function MultipleDocumentView<V extends FileInputValueType = "binary">(
  props: MultipleDocumentViewProps<V>,
) {
  const { layout = "list", reorderable = true, ...rest } = props;
  return (
    <FileInput
      {...rest}
      fileType="document"
      variant="multiple"
      layout={layout}
      reorderable={reorderable}
    />
  );
}
