// src/components/customs/data-viewer/views/table/table-variants.ts
import { cva, type VariantProps } from "class-variance-authority";

export const tableWrapperVariants = cva("overflow-x-auto", {
  variants: {
    variant: {
      default: "rounded-xl border border-border",
      bordered: "rounded-none border-2 border-foreground/15",
      colored: "rounded-xl border border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const tableHeaderRowVariants = cva("hover:bg-transparent", {
  variants: {
    variant: {
      default: "",
      bordered:
        "border-b-2 border-foreground/15 [&>th]:border-r [&>th]:border-border last:[&>th]:border-r-0",
      colored: "bg-muted/40",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const tableBodyRowVariants = cva("transition-colors", {
  variants: {
    variant: {
      default: "hover:bg-muted/50",
      bordered:
        "border-b border-border [&>td]:border-r [&>td]:border-border last:[&>td]:border-r-0",
      colored: "hover:bg-muted/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const tableCellVariants = cva("px-4 py-2", {
  variants: {
    variant: {
      default: "",
      bordered: "border-b border-border",
      colored: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type TableWrapperVariantProps = VariantProps<
  typeof tableWrapperVariants
>;
