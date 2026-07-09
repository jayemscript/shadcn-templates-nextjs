// src/components/custom/accordion/variant-showcase.tsx

"use client";

import React from "react";
import {
  AccordionComponent,
  AccordionVariant,
} from "@/components/custom/accordion";

const sampleItems = [
  {
    id: "item-1",
    title: "What is this accordion variant?",
    content:
      "This is a demonstration of the accordion variant styling. Each variant has unique visual characteristics while maintaining the same functionality.",
  },
  {
    id: "item-2",
    title: "How does it work?",
    content:
      "Click on any item to expand or collapse it. The animation is smooth and accessible, following WAI-ARIA best practices.",
  },
  {
    id: "item-3",
    title: "Can I customize it?",
    content:
      "Yes! You can pass custom className props, change colors, adjust spacing, and more using Tailwind CSS utilities.",
  },
];

interface VariantShowcaseProps {
  variant: AccordionVariant;
}

export function VariantShowcase({ variant }: VariantShowcaseProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{variant} Variant</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-mono">
          variant="{variant}"
        </span>
      </div>
      <AccordionComponent
        variant={variant}
        items={sampleItems}
        type="single"
        collapsible
      />
    </div>
  );
}
