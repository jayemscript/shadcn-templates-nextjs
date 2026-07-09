// src/components/customs/data-viewer/utils/get-row-id.ts

/**
 * Resolves a stable string id for a row: prefers _id, falls back to id,
 * falls back to the row's page index if neither exists.
 */
export function getRowId<T extends Record<string, unknown>>(
  row: T,
  index: number,
): string {
  const id = (row._id ?? row.id) as string | number | undefined;
  return id !== undefined ? String(id) : String(index);
}
