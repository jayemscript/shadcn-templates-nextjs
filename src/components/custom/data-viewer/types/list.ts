// src/components/customs/data-viewer/types/list.ts
import { ReactNode } from "react";

export interface ListViewProps<T extends Record<string, unknown>> {
  /**
   * Field shown as the item's title. Required — this is the minimum needed
   * to render any row. If the row is effectively a single value (e.g. a
   * primitive wrapped in one field), this is the only thing shown.
   */
  primaryField: keyof T | string;
  /** Optional secondary field shown as supporting description text. */
  secondaryField?: keyof T | string;
  /** Full custom renderer — overrides primaryField/secondaryField entirely. */
  listItemComponent?: (props: { row: T; index: number }) => ReactNode;
  /** Optional leading icon/avatar per item (e.g. status icon, user avatar). */
  listItemIcon?: (row: T) => ReactNode;
  /** Optional trailing actions per item (e.g. edit/delete buttons). */
  listItemActions?: (row: T) => ReactNode;
}
