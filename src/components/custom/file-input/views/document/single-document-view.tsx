"use client";

import * as React from "react";
import {
  FileInput,
  type FileInputComponentProps,
} from "../../components/file-input";
import type { FileInputValueType } from "../../types/file-input";

export type SingleDocumentViewProps<V extends FileInputValueType = "binary"> =
  Omit<
    FileInputComponentProps<"document", V, "single">,
    "fileType" | "variant"
  >;

export function SingleDocumentView<V extends FileInputValueType = "binary">(
  props: SingleDocumentViewProps<V>,
) {
  return <FileInput {...props} fileType="document" variant="single" />;
}
