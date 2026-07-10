// src/components/customs/data-viewer/shared/toolbar/bulk-actions.tsx
"use client";

import { TrashIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@/components/ui";
import { CheckboxAction } from "../../types/common";

interface BulkActionsProps<T> {
  actions: CheckboxAction<T>[];
  selectedRows: T[];
  selectedCount: number;
  onActionComplete: () => void;
}

/** Renders one confirm-guarded button per configured bulk action. */
export function BulkActions<T>({
  actions,
  selectedRows,
  selectedCount,
  onActionComplete,
}: BulkActionsProps<T>) {
  if (actions.length === 0) return null;

  return (
    <>
      {actions.map((action, idx) => (
        <AlertDialog key={idx}>
          <AlertDialogTrigger asChild>
            <Button variant={action.variant || "outline"} size="sm">
              {action.icon || <TrashIcon size={16} />}
              <span className="hidden sm:inline">{action.label}</span>
              <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 items-center rounded border px-1 text-[0.625rem] font-medium">
                {selectedCount}
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will{" "}
                  {action.label.toLowerCase()} {selectedCount} row
                  {selectedCount !== 1 ? "s" : ""}.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  action.action(selectedRows);
                  onActionComplete();
                }}
              >
                {action.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </>
  );
}
