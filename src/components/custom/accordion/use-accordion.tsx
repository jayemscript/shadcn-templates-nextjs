"use client";

import { useState, useCallback } from "react";

// Types
export type AccordionVariant =
  | "default"
  | "outline"
  | "filled"
  | "ghost"
  | "card"
  | "glass"
  | "gradient"
  | "minimal"
  | "bordered"
  | "modern";

export type ChangeMode = "code" | "interaction" | "both";

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface UseAccordionProps {
  variant?: AccordionVariant;
  changeMode?: ChangeMode;
  items?: AccordionItemData[];
  defaultValue?: string | string[];
  type?: "single" | "multiple";
  collapsible?: boolean;
  onValueChange?: (value: string | string[]) => void;
}

export interface UseAccordionReturn {
  // State
  activeItems: string | string[];
  currentVariant: AccordionVariant;

  // Actions
  toggleItem: (itemId: string) => void;
  setVariant: (variant: AccordionVariant) => void;
  isItemActive: (itemId: string) => boolean;

  // Computed
  canChangeVariant: boolean;
  showVariantControls: boolean;

  // Props passthrough
  type: "single" | "multiple";
  collapsible: boolean;
}

const VARIANT_OPTIONS: AccordionVariant[] = [
  "default",
  "outline",
  "filled",
  "ghost",
  "card",
  "glass",
  "gradient",
  "minimal",
  "bordered",
  "modern",
];

export function useAccordion({
  variant = "default",
  changeMode = "code",
  items = [],
  defaultValue,
  type = "single",
  collapsible = true,
  onValueChange,
}: UseAccordionProps = {}): UseAccordionReturn {
  const [currentVariant, setCurrentVariant] =
    useState<AccordionVariant>(variant);
  const [activeItems, setActiveItems] = useState<string | string[]>(
    defaultValue ?? (type === "single" ? "" : []),
  );

  // Update variant when prop changes (for code mode)
  const canChangeVariant =
    changeMode === "interaction" || changeMode === "both";
  const showVariantControls =
    changeMode === "interaction" || changeMode === "both";

  const isItemActive = useCallback(
    (itemId: string): boolean => {
      if (type === "single") {
        return activeItems === itemId;
      }
      return Array.isArray(activeItems) && activeItems.includes(itemId);
    },
    [activeItems, type],
  );

  const toggleItem = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (item?.disabled) return;

      let newValue: string | string[];

      if (type === "single") {
        if (collapsible && activeItems === itemId) {
          newValue = "";
        } else {
          newValue = itemId;
        }
      } else {
        const currentArray = Array.isArray(activeItems) ? activeItems : [];
        if (currentArray.includes(itemId)) {
          newValue = currentArray.filter((id) => id !== itemId);
        } else {
          newValue = [...currentArray, itemId];
        }
      }

      setActiveItems(newValue);
      onValueChange?.(newValue);
    },
    [activeItems, type, collapsible, items, onValueChange],
  );

  const setVariant = useCallback(
    (newVariant: AccordionVariant) => {
      if (canChangeVariant) {
        setCurrentVariant(newVariant);
      }
    },
    [canChangeVariant],
  );

  return {
    activeItems,
    currentVariant,
    toggleItem,
    setVariant,
    isItemActive,
    canChangeVariant,
    showVariantControls,
    type,
    collapsible,
  };
}

export { VARIANT_OPTIONS };
