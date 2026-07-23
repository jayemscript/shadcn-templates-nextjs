import * as React from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MessageVariant = "success" | "info" | "warning";

export interface MessageStateProps {
  variant?: MessageVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_STYLES: Record<
  MessageVariant,
  { icon: React.ReactNode; classes: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
    classes:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  info: {
    icon: <Info className="h-4 w-4" aria-hidden="true" />,
    classes: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  warning: {
    icon: <TriangleAlert className="h-4 w-4" aria-hidden="true" />,
    classes:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
};

export function MessageState({
  variant = "info",
  message,
  onDismiss,
  className,
}: MessageStateProps) {
  const { icon, classes } = VARIANT_STYLES[variant];

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        classes,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="flex-1 leading-snug">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="shrink-0 rounded-sm p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
