// src/components/customs/data-viewer/types/card.ts
import { ReactNode } from "react";
import { CardField } from "./common";

export interface CardViewProps<T extends Record<string, unknown>> {
  /** Custom renderer for a single card. Takes priority over cardFields. */
  cardComponent?: (props: { row: T; index: number }) => ReactNode;
  /** Fallback field-mapping renderer, used only if cardComponent isn't provided. */
  cardFields?: CardField<T>[];
  /** Responsive grid column count at the widest breakpoint; scales down on smaller screens. */
  cardColumns?: 1 | 2 | 3 | 4 | 5;
}
