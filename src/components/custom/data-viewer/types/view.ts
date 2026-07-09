// src/components/customs/data-viewer/types/view.ts
import { TableViewProps } from "./table";

/** The visual representation used to display the data. */
export type ViewType = "table" | "card" | "kanban" | "list";

/**
 * Root props for DataViewer. Table view is fully typed now via TableViewProps;
 * card/kanban/list will each contribute their own prop groups here once built —
 * additive only, nothing here will need to change shape when that happens.
 */
export interface DataViewerProps<
  T extends Record<string, unknown>,
> extends TableViewProps<T> {
  /** Which view renders on initial mount. */
  defaultViewType?: ViewType;
  /**
   * Restricts which views are available at all — not just which one is active.
   * Example: pass ["table"] to lock the component to table-only, no toggle shown.
   * Defaults to ["table"] since that's the only view implemented so far.
   */
  availableViews?: ViewType[];
}
