// src/components/customs/data-viewer/shared/toolbar/view-switcher.tsx
"use client";

import {
  KanbanSquareIcon,
  LayoutGrid,
  LayoutList,
  ListIcon,
} from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { ViewType } from "../../types/view";

const VIEW_CONFIG: Record<
  ViewType,
  { icon: typeof LayoutList; label: string }
> = {
  table: { icon: LayoutList, label: "Table View" },
  card: { icon: LayoutGrid, label: "Card View" },
  kanban: { icon: KanbanSquareIcon, label: "Board View" },
  list: { icon: ListIcon, label: "List View" },
};

interface ViewSwitcherProps {
  availableViews: ViewType[];
  activeView: ViewType;
  onChange: (view: ViewType) => void;
  className?: string;
}

/** Renders nothing unless there's more than one view to switch between. */
export function ViewSwitcher({
  availableViews,
  activeView,
  onChange,
  className,
}: ViewSwitcherProps) {
  if (availableViews.length <= 1) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <div
        className={`hidden md:flex items-center gap-1 border rounded-md p-1 ${className ?? ""}`}
      >
        {availableViews.map((view) => {
          const { icon: Icon, label } = VIEW_CONFIG[view];
          return (
            <Tooltip key={view}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === view ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onChange(view)}
                  className="h-8 px-2"
                >
                  <Icon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
