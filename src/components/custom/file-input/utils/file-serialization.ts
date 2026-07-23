import type { Base64FilePayload, BinaryFilePayload } from "../types/file-input";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * Conversion to Base64 only happens here, and only when `valueType="base64"`
 * is requested — binary Files/Blobs are passed through untouched otherwise,
 * per the "don't convert unless asked" requirement.
 */

/** Reads a File as a data URL (e.g. "data:image/png;base64,...."). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error(`Failed to read file "${file.name}"`));
    reader.readAsDataURL(file);
  });
}

/** Strips the "data:<mime>;base64," prefix, returning the raw base64 payload. */
export function stripDataUrlPrefix(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(",");
  return commaIndex === -1 ? dataUrl : dataUrl.slice(commaIndex + 1);
}

export async function fileToBase64Payload(
  file: File,
): Promise<Base64FilePayload> {
  const dataUrl = await readFileAsDataUrl(file);
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    base64: stripDataUrlPrefix(dataUrl),
    dataUrl,
  };
}

/** Binary mode is a passthrough — the original File already satisfies BinaryFilePayload. */
export function fileToBinaryPayload(file: File): BinaryFilePayload {
  return file;
}

export async function filesToBase64Payloads(
  files: File[],
): Promise<Base64FilePayload[]> {
  return Promise.all(files.map(fileToBase64Payload));
}

export function filesToBinaryPayloads(files: File[]): BinaryFilePayload[] {
  return files.map(fileToBinaryPayload);
}

/**
 * Builds a FormData instance for binary multipart upload. `fieldName`
 * defaults to "files" and is repeated once per file, which is the
 * convention most backends (and multer/busboy-style parsers) expect for
 * multi-file fields.
 */
export function buildFormData(files: File[], fieldName = "files"): FormData {
  const formData = new FormData();
  for (const file of files) {
    formData.append(fieldName, file, file.name);
  }
  return formData;
}
