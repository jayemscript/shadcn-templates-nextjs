data-viewer/
  index.ts
  data-viewer.tsx
  types/
    common.ts        → FetchDataParams, FetchDataResult, FilterOption, CardField, CheckboxAction
    table.ts          → table-view props, TableVariant
    kanban.ts          → KanbanColumnDefinition
    view.ts            → ViewType union, root DataViewerProps
  store/
    selection.ts
  hooks/
    use-data-viewer.ts
    use-server-data.ts
    use-url-sync.ts
    use-row-selection.ts
    use-column-resize.ts
  utils/
    get-row-id.ts
  views/
    table/
      table-view.tsx
      table-variants.ts   (cva definitions)
      table-header.tsx
      table-body.tsx
      column-resizer.tsx
  shared/
    toolbar/
      search-input.tsx
      filters-dropdown.tsx
      column-visibility-dropdown.tsx
      view-switcher.tsx
      bulk-actions.tsx
    pagination-controls.tsx
    empty-state.tsx
    skeletons.tsx