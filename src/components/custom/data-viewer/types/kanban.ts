// src/components/customs/data-viewer/types/kanban.ts
import { ReactNode } from "react";

/**
 * Defines one column/bucket in the board. filterKey/filterValue get merged
 * into that column's own fetchData call (e.g. { disbursementStatus: "approved" }),
 * so each column fetches and paginates independently.
 */
export interface KanbanColumnDefinition<T = Record<string, unknown>> {
  id: string;
  title: string;
  filterKey: string;
  filterValue: unknown;
  color?: string;
  description?: string;
  icon?: ReactNode;
}

export interface KanbanViewProps<T extends Record<string, unknown>> {
  enableKanbanView?: boolean;
  kanbanColumns?: KanbanColumnDefinition<T>[];
  kanbanCardComponent?: (props: {
    row: T;
    index: number;
    columnId: string;
  }) => ReactNode;

  /**
   * Optional map of columnId -> array of columnIds it's allowed to drop into.
   * If omitted, every column accepts drops from every other column, and your
   * onCardMove callback is the sole gatekeeper.
   */
  validTransitions?: Record<string, string[]>;

  /**
   * Called after a card is dropped into a new column. DataViewer optimistically
   * moves the card immediately; if this rejects, the card reverts to its
   * original column automatically. Implement your own API call + business
   * rule checks here.
   */
  onCardMove?: (
    row: T,
    fromColumnId: string,
    toColumnId: string,
  ) => Promise<void>;

  /**
   * Called when onCardMove rejects, after the card has already reverted.
   * DataViewer shows no notification of its own — wire this to your app's
   * existing toast/error system.
   */
  onCardMoveError?: (error: unknown, row: T) => void;
}
