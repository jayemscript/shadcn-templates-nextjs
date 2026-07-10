// src/components/customs/data-viewer/hooks/use-column-resize.ts
"use client";

import { useMemo } from "react";
import { Table } from "@tanstack/react-table";

export type ColumnSizeVars = Record<string, number>;

/**
 * Derives CSS custom properties (--header-{id}-size, --col-{id}-size) from
 * the table's current column sizing state. Spread the result onto the
 * <table> element's style prop; columns then reference their own var in CSS
 * (width: calc(var(--col-my-column-size) * 1px)) instead of receiving a
 * fresh inline style on every render.
 *
 * This avoids re-rendering every <th>/<td> as a column is dragged — only the
 * CSS var updates, so the browser repaints without React re-rendering cells
 * that don't own that variable. Recomputes only when sizing actually changes
 * (columnSizingInfo covers the active drag; columnSizing covers the
 * committed onEnd result).
 */
export function useColumnResize<T>(table: Table<T>): ColumnSizeVars {
  const { columnSizingInfo, columnSizing } = table.getState();

  return useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: ColumnSizeVars = {};

    for (const header of headers) {
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }

    return colSizes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnSizingInfo, columnSizing]);
}
