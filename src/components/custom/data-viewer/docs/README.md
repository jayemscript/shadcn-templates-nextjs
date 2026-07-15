# DataViewer

A modular, multi-view data component. Replaces the legacy `data-table`
(1000-line component + 667-line hook) with a clean split by concern:
`types/`, `store/`, `hooks/`, `shared/`, `views/`.

Currently implemented: **table view**. Card, Kanban, and List are scaffolded
in the types but not yet built — using any `availableViews` value other than
`["table"]` will show a "not yet available" placeholder for those views.

**Next session: card view** — becomes the *default* view on mobile widths,
same as the legacy component's mobile-always-card behavior.

---

## What table view can do right now

- Server-side or client-side pagination, search, sort, filter (toggle via
  `enableServerSide`)
- Column sorting (native TanStack)
- Column resizing, drag handle, CSS-variable based for performant re-renders
- Column pinning (left/right), sticky positioning, pin-toggle UI in header
- Column visibility toggle
- Row selection (checkbox pattern — you supply the checkbox column yourself,
  same as legacy)
- Bulk actions with confirm dialog
- Three visual variants: `default` (soft border), `bordered` (full grid),
  `colored` (dynamic per-row color via `getRowColor`)
- URL + localStorage sync for page/limit/search/filters
- Isolated selection state per `<DataViewer>` instance (safe for multiple
  tables on one page, or tabs — not a shared singleton)
- Search, filters (multi-select checkboxes + single-select dropdown), custom
  filter UI via `renderFilters`

## Known gaps / not yet built

- Card, Kanban, List views — placeholder only
- `onRowAction` prop exists but is never called internally — it's there for
  your own `ColumnDef` cell renderers to call, same as legacy
- No built-in "select all across all pages" — selection persists across
  pagination but `toggleAllPageRows` only affects the current page, matching
  legacy behavior

---

## Props reference

### Data + fetching
| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `ColumnDef<T>[]` | required | |
| `fetchData` | `(params: FetchDataParams) => Promise<FetchDataResult<T>>` | — | required for `enableServerSide` |
| `initialData` | `T[]` | `[]` | client-side mode dataset |
| `preloadedData` | `FetchDataResult<T>` | — | skip first fetch (e.g. SSR) |
| `enableServerSide` | `boolean` | `false` | `false` = TanStack handles filter/sort/page client-side |
| `initialLoadDelay` / `fetchLoadDelay` | `number` | `300` / `100` | artificial delay, demo/skeleton purposes |

### Appearance
| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `"default" \| "bordered" \| "colored"` | `"default"` | |
| `getRowColor` | `(row: T) => string \| undefined` | — | only applied when `variant="colored"` |
| `className` | `string` | — | wrapper class |
| `title` / `description` | `string` | — | |
| `emptyStateMessage` | `string` | `"No results found."` | |
| `children` | `ReactNode` | — | rendered above the toolbar |

### Toolbar
| Prop | Type | Default | Notes |
|---|---|---|---|
| `enableSearch` | `boolean` | `true` | |
| `searchPlaceholder` | `string` | `"Search..."` | |
| `enableFilters` | `boolean` | — | needs `filterOptions` non-empty too |
| `filterOptions` | `FilterOption[]` | — | dropdown filters |
| `renderFilters` | `(filters, setFilters) => ReactNode` | — | custom filter UI, e.g. an entity picker |
| `enableColumnVisibility` | `boolean` | `true` | |
| `enableRefreshButton` | `boolean` | `true` | |
| `onRefresh` | `(refreshFn: () => void) => void` | — | lets a parent trigger refresh externally |

### Row behavior
| Prop | Type | Default | Notes |
|---|---|---|---|
| `enableRowSelection` | `boolean` | `true` | |
| `readOnly` | `boolean` | `false` | `true` disables selection even if `enableRowSelection` is `true` |
| `checkboxActions` | `CheckboxAction<T>[]` | `[]` | bulk action buttons + confirm dialog |
| `onRowAction` | `(action: string, row: T) => void` | — | for your own cell renderers to call |

### Column behavior
| Prop | Type | Default | Notes |
|---|---|---|---|
| `enableSorting` | `boolean` | `true` | |
| `enableColumnResizing` | `boolean` | `false` | drag handle appears on hover |
| `enableColumnPinning` | `boolean` | `false` | pin icon appears on header hover; also needs `enablePinning` not `false` on the individual column def |

### Pagination
| Prop | Type | Default |
|---|---|---|
| `enablePagination` | `boolean` | `true` |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` |

### Add button
| Prop | Type | Default |
|---|---|---|
| `onAddNew` | `() => void` | — |
| `addButtonText` | `string` | `"Add New"` |

### Persistence
| Prop | Type | Default | Notes |
|---|---|---|---|
| `enableUrlSync` | `boolean` | `true` | syncs page/limit/keyword/filters to URL + localStorage |
| `storageKey` | `string` | `"default"` | required if multiple tables exist on the same route |

### Multi-view (`DataViewerProps`, not table-specific)
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
- **Display state vs. filter state are different things**: if a filter
  value needs to render as a rich object (name, avatar) somewhere in the UI,
  keep that object in local state separately from `filters` (which should
  only ever hold serializable primitives for the URL/API). Known remaining
  gap: this local display state doesn't currently rehydrate from
  `enableUrlSync` on page load/refresh.

---

## Architecture note (multi-service backend)

`DataViewer`'s only contract with the backend is
`fetchData: (params: FetchDataParams) => Promise<FetchDataResult<T>>`. It
does not care whether that resolves via direct DB query, a monolith
`PaginationService`, or a BFF query-plan engine fanning out across multiple
microservices — as long as the shape comes back correct. Confirmed compatible
with the planned architecture:
`Frontend (DataViewer) → BFF (generic pagination/query engine) → Services
(own filtering/sorting/pagination)`.