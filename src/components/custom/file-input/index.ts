// ---------------------------------------------------------------------------
// Public API entry point for the file-inputs package.
// ---------------------------------------------------------------------------

// Primary component — most consumers only need this.
export { FileInput } from "./components/file-input";
export type { FileInputComponentProps } from "./components/file-input";

// Shared types (FileInputProps, ManagedFile, payload shapes, etc.)
export * from "./types/file-input";

// Building blocks, for consumers who want to compose their own layout
// instead of using FileInputRoot's default dropzone+list composition.
export { FileInputRoot } from "./components/file-input-root";
export type { FileInputRootProps } from "./components/file-input-root";
export { FileInputDropzone } from "./components/file-input-dropzone";
export type { FileInputDropzoneProps } from "./components/file-input-dropzone";
export { FileInputList } from "./components/file-input-list";
export type { FileInputListProps } from "./components/file-input-list";
export { FileInputItem } from "./components/file-input-item";
export type { FileInputItemProps } from "./components/file-input-item";
export { FileInputPreview } from "./components/file-input-preview";
export type { FileInputPreviewProps } from "./components/file-input-preview";
export { FileInputProgress } from "./components/file-input-progress";
export type { FileInputProgressProps } from "./components/file-input-progress";
export { FileInputActions } from "./components/file-input-actions";
export type { FileInputActionsProps } from "./components/file-input-actions";

// Hooks + context, for advanced/custom compositions.
export {
  FileInputContext,
  useFileInput,
  useFileInputContext,
  useFileInputFiles,
  useFileInputGlobalError,
} from "./hooks/use-file-input";
export type { FileInputContextValue } from "./hooks/use-file-input";
export { useFileValidation } from "./hooks/use-file-validation";
export type { UseFileValidationOptions } from "./hooks/use-file-validation";
export { useFilePreview, useFilePreviews } from "./hooks/use-file-preview";
export type { FilePreview } from "./hooks/use-file-preview";
export { useFileUpload } from "./hooks/use-file-upload";
export type {
  UseFileUploadParams,
  UseFileUploadResult,
} from "./hooks/use-file-upload";

// Store factory, in case a consumer needs to build a fully custom UI.
export { createFileInputStore } from "./store/file-input.store";
export type {
  FileInputStoreApi,
  FileInputStoreState,
} from "./store/file-input.store";

// Toolbar pieces, exported in case consumers want to reuse them elsewhere.
export { EmptyState } from "./toolbar/empty-state";
export { ErrorState } from "./toolbar/error-state";
export { LoadingState } from "./toolbar/loading-state";
export { MessageState } from "./toolbar/message-state";
export type { MessageVariant } from "./toolbar/message-state";
export { FileActionsToolbar } from "./toolbar/file-actions";

// Views — ready-made presets per file type + variant.
export { SingleImageView } from "./views/image/single-image-view";
export type { SingleImageViewProps } from "./views/image/single-image-view";
export { MultipleImageView } from "./views/image/multiple-image-view";
export type { MultipleImageViewProps } from "./views/image/multiple-image-view";
export { AvatarView } from "./views/image/avatar-view";
export type { AvatarViewProps } from "./views/image/avatar-view";
export { CoverPhotoView } from "./views/image/cover-photo-view";
export type { CoverPhotoViewProps } from "./views/image/cover-photo-view";

export { SingleDocumentView } from "./views/document/single-document-view";
export type { SingleDocumentViewProps } from "./views/document/single-document-view";
export { MultipleDocumentView } from "./views/document/multiple-document-view";
export type { MultipleDocumentViewProps } from "./views/document/multiple-document-view";

export { SingleAudioView } from "./views/audio/single-audio-view";
export type { SingleAudioViewProps } from "./views/audio/single-audio-view";
export { MultipleAudioView } from "./views/audio/multiple-audio-view";
export type { MultipleAudioViewProps } from "./views/audio/multiple-audio-view";

export { SingleVideoView } from "./views/video/single-video-view";
export type { SingleVideoViewProps } from "./views/video/single-video-view";
export { MultipleVideoView } from "./views/video/multiple-video-view";
export type { MultipleVideoViewProps } from "./views/video/multiple-video-view";

// Utilities genuinely useful to consumers directly (e.g. formatting sizes
// in their own custom UI, or building FormData for a manual fetch call).
export { formatBytes, parseBytes } from "./utils/file-size";
export { buildFormData } from "./utils/file-serialization";
export { resolveFormatConfig, buildAcceptString } from "./utils/file-formats";
export {
  cacheFile,
  getCachedFile,
  invalidateCachedFile,
  invalidateCachedFiles,
  loadCachedFile,
} from "./utils/file-cache";
