# DataViewer

A modular, multi-view data component. Replaces the legacy `data-table`
(1000-line component + 667-line hook) with a clean split by concern:
`types/`, `store/`, `hooks/`, `shared/`, `views/`.

**All four views are implemented: table, card, list, kanban.** Select which
are available via the `availableViews` prop — only listed views are
selectable, and a view switcher appears automatically when more than one is
available.

---

## Shared architecture (applies to every view)

- Server-side or client-side pagination, search, sort, filter (toggle via
  `enableServerSide`)
- Row selection (checkbox pattern — you supply the checkbox column/toggle
  yourself), isolated per `<DataViewer>` instance via a Zustand store
  **factory + React Context** (not a singleton) — safe for multiple tables
  on one page, or tabs with `forceMount` animations
- Bulk actions with confirm dialog (`checkboxActions`)
- URL + localStorage sync for page/limit/search/filters (`enableUrlSync`)
- `DataViewer`'s only contract with your backend is
  `fetchData: (params: FetchDataParams) => Promise<FetchDataResult<T>>` — it
  doesn't care whether that resolves via a direct DB query, a monolith
  `PaginationService`, or a BFF fanning out across microservices. Confirmed
  compatible with: `Frontend (DataViewer) → BFF (query-plan engine) →
  Services (own filtering/sorting/pagination)`.

---

## Table view

- Native TanStack column sorting
- Column resizing (CSS-variable based, drag handle on hover, `onEnd` mode)
- Column pinning (left/right), sticky positioning, pin-toggle UI on header
  hover
- Column visibility toggle
- Three visual variants: `default` (soft border), `bordered` (full grid),
  `colored` (dynamic per-row color via `getRowColor`)

### Table props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `ColumnDef<T>[]` | required | |
| `variant` | `"default" \| "bordered" \| "colored"` | `"default"` | |
| `getRowColor` | `(row: T) => string \| undefined` | — | only applied when `variant="colored"` |
| `enableSorting` | `boolean` | `true` | |
| `enableColumnResizing` | `boolean` | `false` | drag handle appears on hover |
| `enableColumnPinning` | `boolean` | `false` | pin icon on header hover; also needs `enablePinning` not `false` on the individual column def |
| `enablePagination` | `boolean` | `true` | |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | |

---

## Card view

- Responsive grid (`cardColumns`, 1–5, scales down at smaller breakpoints)
- Custom card renderer takes priority; falls back to field-mapping if
  configured; falls back to a minimal id display if neither is given
- Full row accessible at every width — selection checkbox is never hidden on
  mobile (a real bug fixed from the legacy card view, which hid it there)

### Card props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `cardComponent` | `(props: { row: T; index: number }) => ReactNode` | — | takes priority over `cardFields` |
| `cardFields` | `CardField<T>[]` | — | fallback field-mapping renderer if no `cardComponent` |
| `cardColumns` | `1 \| 2 \| 3 \| 4 \| 5` | `3` | grid column count at widest breakpoint |

---

## List view

- **Infinite scroll**, not classic pagination — scrolling near the bottom
  auto-fetches and appends the next page via `IntersectionObserver`; no
  pagination buttons. `pageSizeOptions` still controls how many load per
  batch.
- Built on shadcn's `Item` primitive (accessible rows, keyboard nav, screen
  reader support out of the box)
- Row shape scales from minimal to rich based on what you configure —
  `primaryField` alone = a single line; add `secondaryField` for a
  description row; add `listItemComponent` for a full custom override

### List props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `primaryField` | `keyof T \| string` | required | shown as the item's title |
| `secondaryField` | `keyof T \| string` | — | shown as supporting description text |
| `listItemComponent` | `(props: { row: T; index: number }) => ReactNode` | — | full override, ignores primary/secondaryField |
| `listItemIcon` | `(row: T) => ReactNode` | — | leading icon/avatar per item |
| `listItemActions` | `(row: T) => ReactNode` | — | trailing action buttons per item |

**Note:** list view uses its own data hook (`useInfiniteScroll`), separate
from table/card's `useDataViewer` — it has no `columns`/`ColumnDef` concept
at all, since there's nothing to sort or resize.

---

## Kanban view

- Data is partitioned into columns by a discrete field's value (status
  enum, boolean, type, etc.) — each column fetches and paginates
  **independently**
- Drag-and-drop via `@dnd-kit` (the current standard; `react-beautiful-dnd`
  is deprecated) — install `@dnd-kit/core` and `@dnd-kit/utilities` if not
  already present
- Optimistic card moves: the card visually moves the instant you drop it;
  if your `onCardMove` rejects, it **reverts automatically**
- Backend-agnostic by the same principle as `fetchData` — `DataViewer` never
  calls any status-update API itself; `onCardMove` is entirely yours to
  implement

### Kanban props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `kanbanColumns` | `KanbanColumnDefinition<T>[]` | required to render | each column needs `id`, `title`, `filterKey`, `filterValue`; optional `color`, `description`, `icon` |
| `kanbanCardComponent` | `(props: { row: T; index: number; columnId: string }) => ReactNode` | — | falls back to a minimal title/id card if omitted |
| `validTransitions` | `Record<string, string[]>` | — | optional map of `columnId → allowed target columnIds`. If omitted, every transition is allowed at the UI level and your `onCardMove` is the sole gatekeeper. Shows a live red/blue drop-target highlight during drag. |
| `onCardMove` | `(row: T, fromColumnId: string, toColumnId: string) => Promise<void>` | — | implement your own API call + business rule checks here |
| `onCardMoveError` | `(error: unknown, row: T) => void` | — | called after automatic revert; wire to your own toast/error system — DataViewer shows no notification of its own |

**Requirement:** every row needs a real `_id`/`id` field for drag tracking to
work correctly. Table/card/list degrade gracefully without one (falls back
to index); kanban does not — cards are tracked across two different arrays
during a move, so index-based fallback isn't reliable there.

**Not yet built:** per-column error state UI (a failed column fetch clears
loading silently — no visible error, matching the "component owns mechanics,
you own notifications" principle, but there's no `boardError` map exposed
yet if you want to surface it).

---

## Shared props (all views)

### Toolbar
| Prop | Type | Default | Notes |
|---|---|---|---|
| `enableSearch` | `boolean` | `true` | |
| `searchPlaceholder` | `string` | `"Search..."` | |
| `enableFilters` | `boolean` | — | needs `filterOptions` non-empty too |
| `filterOptions` | `FilterOption[]` | — | dropdown filters |
| `renderFilters` | `(filters, setFilters) => ReactNode` | — | custom filter UI, e.g. an entity picker |
| `enableColumnVisibility` | `boolean` | `true` | table view only |
| `enableRefreshButton` | `boolean` | `true` | |
| `onRefresh` | `(refreshFn: () => void) => void` | — | lets a parent trigger refresh externally |

### Row behavior
| Prop | Type | Default | Notes |
|---|---|---|---|
| `enableRowSelection` | `boolean` | `true` | |
| `readOnly` | `boolean` | `false` | disables selection even if `enableRowSelection` is `true` |
| `checkboxActions` | `CheckboxAction<T>[]` | `[]` | bulk action buttons + confirm dialog |
| `onRowAction` | `(action: string, row: T) => void` | — | never called internally — for your own cell renderers to call |

### Data + fetching
| Prop | Type | Default | Notes |
|---|---|---|---|
| `fetchData` | `(params: FetchDataParams) => Promise<FetchDataResult<T>>` | — | required for `enableServerSide` |
| `initialData` | `T[]` | `[]` | client-side mode dataset (table/card only) |
| `preloadedData` | `FetchDataResult<T>` | — | skip first fetch (e.g. SSR) |
| `enableServerSide` | `boolean` | `false` | `false` = TanStack handles filter/sort/page client-side (table/card only) |
| `initialLoadDelay` / `fetchLoadDelay` | `number` | `300` / `100` | artificial delay, demo/skeleton purposes |

### Appearance
| Prop | Type | Default | Notes |
|---|---|---|---|
| `className` | `string` | — | wrapper class |
| `title` / `description` | `string` | — | |
| `emptyStateMessage` | `string` | `"No results found."` | |
| `children` | `ReactNode` | — | rendered above the toolbar |

### Add button
| Prop | Type | Default |
|---|---|---|
| `onAddNew` | `() => void` | — |
| `addButtonText` | `string` | `"Add New"` |

### Persistence
| Prop | Type | Default | Notes |
|---|---|---|---|
| `enableUrlSync` | `boolean` | `true` | syncs page/limit/keyword/filters to URL + localStorage (table/card/list) |
| `storageKey` | `string` | `"default"` | required if multiple tables exist on the same route |

### Multi-view
| Prop | Type | Default | Notes |
|---|---|---|---|
| `defaultViewType` | `"table" \| "card" \| "kanban" \| "list"` | `"table"` | |
| `availableViews` | `ViewType[]` | `["table"]` | only listed views are selectable; `.length > 1` shows the view switcher |

---

## Known bug patterns caught during real-world testing

- **`dataKey` mismatch**: backend `PaginationService.paginate()` lets each
  endpoint set a custom `dataKey` (e.g. `expense_disbursement_data` instead
  of `data`). Every `fetchData` implementation must map its endpoint's actual
  response envelope — don't assume `data`.
- **`any` hides real bugs**: using `<DataViewer<any>>` let a filter's string
  id get passed to a component expecting a full object (`UserPicker`), with
  no error. Always specify the real generic: `<DataViewer<YourRowType>>`.
- **Missing index signature**: a plain `interface` (not `type`) doesn't
  auto-satisfy the `Record<string, unknown>` generic constraint even when
  every field is structurally compatible. Fix: intersect at the call site —
  `type YourRow = YourInterface & Record<string, unknown>` — rather than
  editing the original interface.
- **Display state vs. filter state are different things**: if a filter
  value needs to render as a rich object (name, avatar) somewhere in the UI,
  keep that object in local state separately from `filters` (which should
  only ever hold serializable primitives for the URL/API). Known remaining
  gap: this local display state doesn't currently rehydrate from
  `enableUrlSync` on page load/refresh.
- **Generic inference silently falls back**: with props referencing `T` in
  mixed variance positions (e.g. `fetchData`'s return type and
  `checkboxActions[].action`'s parameter type), TypeScript can fail to infer
  `T` and silently falls back to the constraint default. Always pass the
  generic explicitly: `<DataViewer<YourRowType> ...>`, never rely on
  inference for this component.

---

## Setup checklist for a new view/table

1. Define your row type: `interface MyRow extends Record<string, unknown> { ... }`
   (or intersect an existing interface: `MyExisting & Record<string, unknown>`)
2. Write `fetchData`, mapping your endpoint's actual response envelope to
   `{ data, totalItems, totalPages, currentPage }`
3. Pick `availableViews` — start with `["table"]` and expand once confirmed
   working
4. Always specify the generic explicitly: `<DataViewer<MyRow> ...>`
5. For kanban specifically: confirm every row has a real `id`/`_id` before
   enabling drag-and-drop

---

## Dependencies

Core (all views):
```bash
npm install @tanstack/react-table zustand class-variance-authority lucide-react
pnpm add @tanstack/react-table zustand class-variance-authority lucide-react
yarn add @tanstack/react-table zustand class-variance-authority lucide-react
```

Kanban view only (drag-and-drop):
```bash
npm install @dnd-kit/core @dnd-kit/utilities
pnpm add @dnd-kit/core @dnd-kit/utilities
yarn add @dnd-kit/core @dnd-kit/utilities
```

Also required: shadcn/ui components — `button`, `input`, `checkbox`,
`table`, `card`, `skeleton`, `dropdown-menu`, `select`, `pagination`,
`alert-dialog`, `label`, `tooltip`, `item` (list view). Install any missing
ones via `npx shadcn add <component>`.