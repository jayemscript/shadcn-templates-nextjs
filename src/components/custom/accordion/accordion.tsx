//src/components/custom/accordion/accordion.tsx
"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@/components/ui";
import {
  useAccordion,
  AccordionVariant,
  ChangeMode,
  AccordionItemData,
  VARIANT_OPTIONS,
} from "./use-accordion";

// Variant styles configuration
const variantStyles: Record<
  AccordionVariant,
  {
    container: string;
    item: string;
    trigger: string;
    triggerActive: string;
    content: string;
    icon: string;
  }
> = {
  default: {
    container: "border-b",
    item: "border-b",
    trigger:
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
    triggerActive: "",
    content:
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 transition-transform duration-200",
  },
  outline: {
    container: "space-y-2",
    item: "rounded-lg border border-border bg-background",
    trigger:
      "flex flex-1 items-center justify-between px-4 py-3 font-medium transition-colors hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180",
    triggerActive: "bg-muted/30",
    content:
      "overflow-hidden text-sm px-4 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
  },
  filled: {
    container: "space-y-2",
    item: "rounded-lg bg-muted/50",
    trigger:
      "flex flex-1 items-center justify-between px-4 py-3 font-medium transition-colors hover:bg-muted [&[data-state=open]>svg]:rotate-180",
    triggerActive: "bg-muted",
    content:
      "overflow-hidden text-sm px-4 pb-3 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
  },
  ghost: {
    container: "space-y-1",
    item: "rounded-md",
    trigger:
      "flex flex-1 items-center justify-between px-3 py-2.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground [&[data-state=open]>svg]:rotate-180",
    triggerActive: "bg-accent text-accent-foreground",
    content:
      "overflow-hidden text-sm px-3 pb-2.5 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 opacity-60 transition-transform duration-200",
  },
  card: {
    container: "space-y-3",
    item: "rounded-xl border border-border bg-card shadow-sm overflow-hidden",
    trigger:
      "flex flex-1 items-center justify-between px-5 py-4 font-semibold transition-all hover:bg-accent/50 [&[data-state=open]>svg]:rotate-180",
    triggerActive: "bg-accent/30",
    content:
      "overflow-hidden text-sm px-5 pb-4 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
  },
  glass: {
    container: "space-y-3 backdrop-blur-sm",
    item: "rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg",
    trigger:
      "flex flex-1 items-center justify-between px-5 py-4 font-medium text-foreground/90 transition-all hover:bg-white/20 [&[data-state=open]>svg]:rotate-180",
    triggerActive: "bg-white/25",
    content:
      "overflow-hidden text-sm px-5 pb-4 text-foreground/80 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 text-foreground/70 transition-transform duration-200",
  },
  gradient: {
    container: "space-y-3",
    item: "rounded-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20",
    trigger:
      "flex flex-1 items-center justify-between px-5 py-4 font-semibold bg-gradient-to-r from-primary/5 to-transparent transition-all hover:from-primary/10 [&[data-state=open]>svg]:rotate-180",
    triggerActive: "from-primary/15",
    content:
      "overflow-hidden text-sm px-5 pb-4 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 text-primary transition-transform duration-200",
  },
  minimal: {
    container: "divide-y divide-border",
    item: "",
    trigger:
      "flex flex-1 items-center justify-between py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&[data-state=open]>svg]:rotate-180 [&[data-state=open]]:text-foreground",
    triggerActive: "text-foreground",
    content:
      "overflow-hidden text-sm pb-3 text-muted-foreground transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
  },
  bordered: {
    container: "space-y-2",
    item: "rounded-lg border-2 border-border transition-colors",
    trigger:
      "flex flex-1 items-center justify-between px-4 py-3 font-medium transition-colors hover:border-primary/50 [&[data-state=open]]:border-primary [&[data-state=open]>svg]:rotate-180",
    triggerActive: "",
    content:
      "overflow-hidden text-sm px-4 pb-3 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
  },
  modern: {
    container: "space-y-2",
    item: "rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm hover:shadow-md transition-shadow",
    trigger:
      "flex flex-1 items-center justify-between px-5 py-4 font-medium transition-all hover:translate-x-1 [&[data-state=open]>svg]:rotate-180",
    triggerActive: "bg-gradient-to-r from-primary/5 to-transparent",
    content:
      "overflow-hidden text-sm px-5 pb-4 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    icon: "h-4 w-4 shrink-0 text-primary/70 transition-transform duration-200",
  },
};

export interface AccordionComponentProps {
  variant?: AccordionVariant;
  changeMode?: ChangeMode;
  className?: string;
  items?: AccordionItemData[];
  defaultValue?: string | string[];
  type?: "single" | "multiple";
  collapsible?: boolean;
  onValueChange?: (value: string | string[]) => void;
  showControls?: boolean;
}

export function AccordionComponent({
  variant = "default",
  changeMode = "code",
  className,
  items = [],
  defaultValue,
  type = "single",
  collapsible = true,
  onValueChange,
  showControls,
}: AccordionComponentProps) {
  const {
    activeItems,
    currentVariant,
    toggleItem,
    setVariant,
    isItemActive,
    canChangeVariant,
    showVariantControls,
  } = useAccordion({
    variant,
    changeMode,
    items,
    defaultValue,
    type,
    collapsible,
    onValueChange,
  });

  const styles = variantStyles[currentVariant];
  const shouldShowControls = showControls ?? showVariantControls;

  return (
    <div className={cn("w-full", className)}>
      {/* Variant Controls */}
      {shouldShowControls && canChangeVariant && (
        <div className="mb-6 p-4 rounded-lg border bg-muted/30">
          <Label className="text-sm font-medium mb-2 block">
            Select Variant Style
          </Label>
          <Select
            value={currentVariant}
            onValueChange={(value) => setVariant(value as AccordionVariant)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a variant" />
            </SelectTrigger>
            <SelectContent>
              {VARIANT_OPTIONS.map((v) => (
                <SelectItem key={v} value={v}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Accordion Items */}
      <div className={cn(styles.container)}>
        {items.map((item) => {
          const isActive = isItemActive(item.id);

          return (
            <div
              key={item.id}
              className={cn(
                styles.item,
                item.disabled && "opacity-50 pointer-events-none",
              )}
            >
              <button
                onClick={() => toggleItem(item.id)}
                disabled={item.disabled}
                className={cn(
                  "w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",
                  styles.trigger,
                  isActive && styles.triggerActive,
                )}
                aria-expanded={isActive}
                aria-controls={`content-${item.id}`}
                id={`trigger-${item.id}`}
              >
                <span>{item.title}</span>
                <ChevronDown className={styles.icon} />
              </button>

              <div
                id={`content-${item.id}`}
                role="region"
                aria-labelledby={`trigger-${item.id}`}
                data-state={isActive ? "open" : "closed"}
                className={cn(!isActive && "hidden", styles.content)}
              >
                <div className="pt-1">{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
