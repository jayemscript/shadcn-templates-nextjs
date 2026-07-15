// src/components/customs/data-viewer/views/card/card-item.tsx
"use client";

import { ReactNode } from "react";
import { Card, CardContent, Checkbox } from "@/components/ui";
import { cn } from "@/lib/utils";
import { CardField } from "../../types/common";

interface CardItemProps<T extends Record<string, unknown>> {
  row: T;
  index: number;
  cardComponent?: (props: { row: T; index: number }) => ReactNode;
  cardFields?: CardField<T>[];
  enableSelection: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export function CardItem<T extends Record<string, unknown>>({
  row,
  index,
  cardComponent,
  cardFields,
  enableSelection,
  isSelected,
  onToggleSelect,
}: CardItemProps<T>) {
  const content = cardComponent ? (
    cardComponent({ row, index })
  ) : cardFields && cardFields.length > 0 ? (
    <DefaultCardFields row={row} fields={cardFields} />
  ) : (
    <RawRowFallback row={row} />
  );

  return (
    <Card className={cn("w-full", isSelected && "ring-2 ring-primary")}>
      <CardContent className="p-4">
        {enableSelection ? (
          <div className="flex gap-3">
            <div className="flex items-start pt-1 shrink-0">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                aria-label={`Select row ${index + 1}`}
              />
            </div>
            <div className="flex-1 min-w-0">{content}</div>
          </div>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}

interface DefaultCardFieldsProps<T> {
  row: T;
  fields: CardField<T>[];
}

function DefaultCardFields<T extends Record<string, unknown>>({
  row,
  fields,
}: DefaultCardFieldsProps<T>) {
  return (
    <dl className="space-y-1.5">
      {fields.map((field) => {
        const key = String(field.key);
        const rawValue = row[key];
        const displayValue = field.render
          ? field.render(rawValue, row)
          : rawValue !== null && rawValue !== undefined
            ? String(rawValue)
            : "-";

        return (
          <div
            key={key}
            className={cn(
              "flex justify-between gap-2 text-sm",
              field.className,
            )}
          >
            {field.label && (
              <dt className="text-muted-foreground shrink-0">{field.label}</dt>
            )}
            <dd className="text-right truncate">{displayValue}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/** Used only when neither cardComponent nor cardFields is provided. */
function RawRowFallback<T extends Record<string, unknown>>({
  row,
}: {
  row: T;
}) {
  const id = (row._id ?? row.id) as string | number | undefined;
  return (
    <div className="text-sm text-muted-foreground">
      {id !== undefined ? `Row ${id}` : "No card renderer configured"}
    </div>
  );
}
