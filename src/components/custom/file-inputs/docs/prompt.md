# Build a Reusable File Input Component

Create a reusable, production-ready file input component system using:

* React + TypeScript
* shadcn/ui
* Tailwind CSS
* dnd-kit
* Zustand
* Lucide icons

The component must be responsive, accessible, customizable, and reusable across different projects.

## Supported File Types

### Image Upload

Variants:

* `single`
* `multiple`
* `avatar`
* `cover-photo`

Supported formats:

* JPEG
* PNG
* WebP
* GIF
* TIFF
* RAW

### Document Upload

Variants:

* `single`
* `multiple`

Supported formats:

* PDF
* DOC
* DOCX
* CSV
* XLS
* XLSX
* TXT
* MD
* Other configurable formats

### Audio Upload

Variants:

* `single`
* `multiple`

### Video Upload

Variants:

* `single`
* `multiple`

## Required Props

```ts
type FileInputProps = {
  valueType?: "base64" | "binary";
  fileType: "image" | "document" | "audio" | "video";
  variant?: string;
  maxSize?: number;
  maxFiles?: number;
  format?: "all" | string | string[];
  dragAndDrop?: boolean;
  reorderable?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  validate?: (file: File) => string | null | Promise<string | null>;
  onChange?: (value: unknown, files: File[]) => void;
  onProgress?: (progress: number, file: File) => void;
  onError?: (error: string, file?: File) => void;
};
```

Use strongly typed discriminated unions so the available `variant` values depend on the selected `fileType`.

## Payload Support

The component must support two output modes:

### Raw JSON Payload

Used when `valueType="base64"`.

Return file data that can be included in a JSON request:

```ts
{
  name: string;
  type: string;
  size: number;
  base64: string;
  dataUrl?: string;
}
```

### Raw Binary Payload

Used when `valueType="binary"`.

Return the original browser `File` or `Blob`, suitable for:

* `FormData`
* Multipart uploads
* Presigned URL uploads
* Direct binary API requests

Do not convert binary files to Base64 unless `valueType="base64"` is explicitly selected.

## Features

The component must support:

* Click-to-upload
* Drag-and-drop, with an option to disable it
* Reordering multiple files using dnd-kit
* File previews
* Upload progress indicators
* Remove, replace, retry, and clear actions
* Custom icons
* Custom validation
* File-size validation
* File-format validation
* Maximum file-count validation
* Controlled and uncontrolled state
* Custom styles and layouts
* Grid, list, compact, avatar, and cover-photo layouts
* Dark mode
* Mobile responsiveness
* Keyboard accessibility
* Loading, empty, error, success, and uploading states

Use Zustand with an instance-safe store so multiple file input components can exist on the same page without sharing state accidentally.

Use object URLs for previews and revoke them when no longer needed.

TIFF and RAW images may not be previewable in browsers, so show a fallback file card instead of failing.

The component must be backend-agnostic. File selection and file uploading should be separate. Allow the parent application to provide a custom upload handler.

## Folder Structure

Use this structure and improve it when necessary:

```txt
file-inputs/
  components/
    file-input.tsx
    file-input-root.tsx
    file-input-dropzone.tsx
    file-input-list.tsx
    file-input-item.tsx
    file-input-preview.tsx
    file-input-progress.tsx
    file-input-actions.tsx

  hooks/
    use-file-input.ts
    use-file-preview.ts
    use-file-validation.ts
    use-file-upload.ts

  store/
    file-input.store.ts

  toolbar/
    empty-state.tsx
    error-state.tsx
    loading-state.tsx
    message-state.tsx
    file-actions.tsx

  types/
    file-input.ts

  utils/
    file-validation.ts
    file-serialization.ts
    file-formats.ts
    file-preview.ts
    file-size.ts

  views/
    image/
      single-image-view.tsx
      multiple-image-view.tsx
      avatar-view.tsx
      cover-photo-view.tsx

    document/
      single-document-view.tsx
      multiple-document-view.tsx

    audio/
      single-audio-view.tsx
      multiple-audio-view.tsx

    video/
      single-video-view.tsx
      multiple-video-view.tsx

  index.ts
```

## Implementation Requirements

* Keep UI, validation, state, serialization, and upload logic separated.
* Avoid one large component file.
* Use reusable compound components where appropriate.
* Include complete TypeScript types.
* Include realistic usage examples for every file type and variant.
* Include examples for Base64 JSON payloads and raw binary uploads with `FormData`.
* Explain important architecture decisions briefly.
* Return complete working code, not pseudocode.
* Feel free to improve the API and folder structure when there is a better implementation.

Use these references for visual and UX inspiration but feel free to search any resources:

* https://www.shadcnblocks.com/components/file-upload
* https://shadcnstudio.com/blocks/dashboard-and-application/file-upload
