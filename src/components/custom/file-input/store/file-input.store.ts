import { createStore, type StoreApi } from "zustand/vanilla";
import type { ManagedFile } from "../types/file-input";
import { revokeObjectUrl } from "../utils/file-preview";

/**
 * ARCHITECTURE NOTE
 * ------------------
 * This is a *factory*, not a module-level singleton store. A singleton
 * `create()` call at module scope would be shared by every FileInput on the
 * page — exactly what we need to avoid. Instead, `createFileInputStore()`
 * is called once per <FileInputRoot> instance (inside a hook, via
 * useState/useRef so it survives re-renders but not remounts), and that
 * store instance is handed down through React context to the rest of the
 * subtree. See hooks/use-file-input.ts for where it's instantiated.
 */

export interface FileInputState {
  files: ManagedFile[];
  globalError: string | null;
}

export interface FileInputActions {
  setFiles: (files: ManagedFile[]) => void;
  addFiles: (newFiles: ManagedFile[]) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, patch: Partial<ManagedFile>) => void;
  replaceFile: (id: string, next: ManagedFile) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  clearFiles: () => void;
  setGlobalError: (error: string | null) => void;
  reset: () => void;
}

export type FileInputStoreState = FileInputState & FileInputActions;
export type FileInputStoreApi = StoreApi<FileInputStoreState>;

function arrayMove<T>(list: T[], from: number, to: number): T[] {
  if (from === to) return list;
  const copy = list.slice();
  const [moved] = copy.splice(from, 1);
  if (moved === undefined) return copy;
  const clampedTo = Math.max(0, Math.min(to, copy.length));
  copy.splice(clampedTo, 0, moved);
  return copy;
}

export function createFileInputStore(
  initialFiles: ManagedFile[] = [],
): FileInputStoreApi {
  return createStore<FileInputStoreState>((set, get) => ({
    files: initialFiles,
    globalError: null,

    setFiles: (files) => set({ files }),

    addFiles: (newFiles) =>
      set((state) => ({ files: [...state.files, ...newFiles] })),

    removeFile: (id) => {
      const target = get().files.find((f) => f.id === id);
      revokeObjectUrl(target?.previewUrl);
      set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
    },

    updateFile: (id, patch) =>
      set((state) => ({
        files: state.files.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      })),

    replaceFile: (id, next) => {
      const target = get().files.find((f) => f.id === id);
      if (target?.previewUrl && target.previewUrl !== next.previewUrl) {
        revokeObjectUrl(target.previewUrl);
      }
      set((state) => ({
        files: state.files.map((f) => (f.id === id ? next : f)),
      }));
    },

    reorderFiles: (fromIndex, toIndex) =>
      set((state) => ({ files: arrayMove(state.files, fromIndex, toIndex) })),

    clearFiles: () => {
      for (const f of get().files) revokeObjectUrl(f.previewUrl);
      set({ files: [], globalError: null });
    },

    setGlobalError: (error) => set({ globalError: error }),

    reset: () => {
      for (const f of get().files) revokeObjectUrl(f.previewUrl);
      set({ files: initialFiles, globalError: null });
    },
  }));
}
