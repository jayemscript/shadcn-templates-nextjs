// src/components/customs/data-viewer/store/selection.tsx
"use client";

import { createContext, ReactNode, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

interface SelectionStoreState {
  selectedRowIds: Set<string>;
  get: () => string[];
  store: (ids: string[] | string) => void;
  clear: () => void;
  clearSelected: (ids: string[] | string) => void;
  isSelected: (id: string) => boolean;
  toggleSelected: (id: string) => void;
  getSelectionCount: () => number;
}

type SelectionStoreApi = ReturnType<typeof createSelectionStore>;

function createSelectionStore() {
  return createStore<SelectionStoreState>((set, get) => ({
    selectedRowIds: new Set(),

    get: () => Array.from(get().selectedRowIds),

    store: (ids) => {
      set((state) => {
        const newSet = new Set(state.selectedRowIds);
        if (Array.isArray(ids)) {
          ids.forEach((id) => newSet.add(id));
        } else {
          newSet.add(ids);
        }
        return { selectedRowIds: newSet };
      });
    },

    clear: () => set({ selectedRowIds: new Set() }),

    clearSelected: (ids) => {
      set((state) => {
        const newSet = new Set(state.selectedRowIds);
        if (Array.isArray(ids)) {
          ids.forEach((id) => newSet.delete(id));
        } else {
          newSet.delete(ids);
        }
        return { selectedRowIds: newSet };
      });
    },

    isSelected: (id) => get().selectedRowIds.has(id),

    toggleSelected: (id) => {
      set((state) => {
        const newSet = new Set(state.selectedRowIds);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return { selectedRowIds: newSet };
      });
    },

    getSelectionCount: () => get().selectedRowIds.size,
  }));
}

const SelectionStoreContext = createContext<SelectionStoreApi | null>(null);

/** Wraps one DataViewer instance so its selection state is isolated from any other. */
export function SelectionStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<SelectionStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createSelectionStore();
  }

  return (
    <SelectionStoreContext.Provider value={storeRef.current}>
      {children}
    </SelectionStoreContext.Provider>
  );
}

export function useSelectionStore<T>(
  selector: (state: SelectionStoreState) => T,
): T {
  const store = useContext(SelectionStoreContext);
  if (!store) {
    throw new Error(
      "useSelectionStore must be used within a SelectionStoreProvider",
    );
  }
  return useStore(store, selector);
}
