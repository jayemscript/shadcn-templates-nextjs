// src/components/customs/data-viewer/types/view.ts
import { TableViewProps } from "./table";
import { CardViewProps } from "./card";
import { ListViewProps } from "./list";
import { KanbanViewProps } from "./kanban";

export type ViewType = "table" | "card" | "kanban" | "list";

export interface DataViewerProps<T extends Record<string, unknown>>
  extends
    TableViewProps<T>,
    CardViewProps<T>,
    ListViewProps<T>,
    KanbanViewProps<T> {
  defaultViewType?: ViewType;
  availableViews?: ViewType[];
}
