// src/components/customs/data-viewer/data-viewer.tsx
"use client";

import { useState } from "react";
import { DataViewerProps, ViewType } from "./types/view";
import { SelectionStoreProvider } from "./store/selection";
import { ViewSwitcher } from "./shared/toolbar/view-switcher";
import { TableView } from "./views/table/table-view";
import { CardView } from "./views/card/card-view";
import { ListView } from "./views/list/list-view";
import { KanbanView } from "./views/kanban/kanban-view";

export function DataViewer<T extends Record<string, unknown>>({
  defaultViewType = "table",
  availableViews = ["table"],
  ...viewProps
}: DataViewerProps<T>) {
  const [activeView, setActiveView] = useState<ViewType>(
    availableViews.includes(defaultViewType)
      ? defaultViewType
      : availableViews[0],
  );

  return (
    <SelectionStoreProvider>
      {availableViews.length > 1 && (
        <div className="flex justify-end mb-2">
          <ViewSwitcher
            availableViews={availableViews}
            activeView={activeView}
            onChange={setActiveView}
          />
        </div>
      )}

      {activeView === "table" && <TableView {...viewProps} />}
      {activeView === "card" && <CardView {...viewProps} />}
      {activeView === "list" && <ListView {...viewProps} />}
      {activeView === "kanban" &&
        (viewProps.kanbanColumns && viewProps.kanbanColumns.length > 0 ? (
          <KanbanView {...viewProps} kanbanColumns={viewProps.kanbanColumns} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Kanban view is not configured — pass kanbanColumns to enable it.
          </div>
        ))}
    </SelectionStoreProvider>
  );
}
