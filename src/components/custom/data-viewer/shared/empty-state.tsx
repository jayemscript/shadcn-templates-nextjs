// src/components/customs/data-viewer/shared/empty-state.tsx
"use client";

import { CircleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  /** When provided, renders as an error state (icon + destructive text + retry). */
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function EmptyState({
  message,
  error,
  onRetry,
  className,
}: EmptyStateProps) {
  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-32 text-destructive",
          className,
        )}
      >
        <div className="text-center">
          <CircleAlertIcon className="mx-auto mb-2" size={24} />
          <p>Error: {error}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="mt-2">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("text-center py-12 text-muted-foreground", className)}>
      {message}
    </div>
  );
}
