// src/components/customs/data-viewer/views/list/list-item.tsx
"use client";

import { ReactNode } from "react";
import {
  Checkbox,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface ListItemProps<T extends Record<string, unknown>> {
  row: T;
  index: number;
  primaryField: keyof T | string;
  secondaryField?: keyof T | string;
  listItemComponent?: (props: { row: T; index: number }) => ReactNode;
  listItemIcon?: (row: T) => ReactNode;
  listItemActions?: (row: T) => ReactNode;
  enableSelection: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function resolveFieldValue<T extends Record<string, unknown>>(
  row: T,
  field: keyof T | string,
): string {
  const value = row[String(field)];
  if (value === null || value === undefined) return "-";
  return String(value);
}

export function ListItem<T extends Record<string, unknown>>({
  row,
  index,
  primaryField,
  secondaryField,
  listItemComponent,
  listItemIcon,
  listItemActions,
  enableSelection,
  isSelected,
  onToggleSelect,
}: ListItemProps<T>) {
  const content = listItemComponent ? (
    listItemComponent({ row, index })
  ) : (
    <ItemContent>
      <ItemTitle>{resolveFieldValue(row, primaryField)}</ItemTitle>
      {secondaryField && (
        <ItemDescription>
          {resolveFieldValue(row, secondaryField)}
        </ItemDescription>
      )}
    </ItemContent>
  );

  const icon = listItemIcon?.(row);
  const actions = listItemActions?.(row);

  return (
    <Item variant="outline" className={cn(isSelected && "ring-2 ring-primary")}>
      {enableSelection && (
        <div className="flex items-center pr-1 shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select row ${index + 1}`}
          />
        </div>
      )}

      {icon && <ItemMedia variant="icon">{icon}</ItemMedia>}

      {content}

      {actions && <ItemActions>{actions}</ItemActions>}
    </Item>
  );
}
