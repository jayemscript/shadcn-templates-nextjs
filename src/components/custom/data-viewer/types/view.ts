// src/components/customs/data-viewer/types/view.ts
import { TableViewProps } from "./table";
import { CardViewProps } from "./card";
import { ListViewProps } from "./list";

/** The visual representation used to display the data. */
export type ViewType = "table" | "card" | "kanban" | "list";

/**
 * Root props for DataViewer. Table, card, and list view are fully typed now;
 * kanban will contribute its own prop group here once built — additive
 * only, nothing here needs to change shape when that happens.
 */
export interface DataViewerProps<T extends Record<string, unknown>>
  extends TableViewProps<T>, CardViewProps<T>, ListViewProps<T> {
  /** Which view renders on initial mount. */
  defaultViewType?: ViewType;
  /**
   * Restricts which views are available at all — not just which one is active.
   * Example: pass ["table"] to lock the component to table-only, no toggle shown.
   * Defaults to ["table"].
   */
  availableViews?: ViewType[];
}
