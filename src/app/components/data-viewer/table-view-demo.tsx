// src/app/components/data-viewer/table-view-demo.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui";
import { DataViewer } from "@/components/custom/data-viewer/data-viewer";
import {
  FetchDataParams,
  FetchDataResult,
} from "@/components/custom/data-viewer/types/common";
import {
  DisbursementStatus,
  DisbursementType,
  ExpenseDisbursementInfo,
  GetAllPaginatedExpenseDisbursement,
} from "./interface";

async function fetchExpenseDisbursements(
  params: FetchDataParams,
): Promise<FetchDataResult<ExpenseDisbursementInfo>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);
  if (params.filters && Object.keys(params.filters).length > 0) {
    query.set("filters", JSON.stringify(params.filters));
  }

  const res = await fetch(
    `http://localhost:3006/api/expense-disbursement/get-all-paginated?${query.toString()}`,
  );

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  const json: GetAllPaginatedExpenseDisbursement = await res.json();

  return {
    data: json.expense_disbursement_data ?? [],
    totalItems: json.totalItems ?? 0,
    totalPages: json.totalPages ?? 0,
    currentPage: json.currentPage ?? params.page,
  };
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PHP",
});

const STATUS_LABEL: Record<DisbursementStatus, string> = {
  [DisbursementStatus.REQUESTED]: "Requested",
  [DisbursementStatus.APPROVED]: "Approved",
  [DisbursementStatus.REJECTED]: "Rejected",
  [DisbursementStatus.DISBURSED]: "Disbursed",
  [DisbursementStatus.LIQUIDATED]: "Liquidated",
  [DisbursementStatus.CLOSED]: "Closed",
};

const TYPE_LABEL: Record<DisbursementType, string> = {
  [DisbursementType.CASH_ADVANCE]: "Cash Advance",
  [DisbursementType.DIRECT_PAYMENT]: "Direct Payment",
  [DisbursementType.REIMBURSEMENT]: "Reimbursement",
  [DisbursementType.PURCHASE_ORDER]: "Purchase Order",
};

const columns: ColumnDef<ExpenseDisbursementInfo>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "cashAdvanceNo",
    header: "Reference No.",
  },
  {
    accessorKey: "disbursementType",
    header: "Type",
    cell: ({ getValue }) => TYPE_LABEL[getValue<DisbursementType>()],
  },
  {
    accessorKey: "disbursementStatus",
    header: "Status",
    cell: ({ getValue }) => STATUS_LABEL[getValue<DisbursementStatus>()],
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
  },
  {
    accessorKey: "requestedDate",
    header: "Requested Date",
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
  },
];

export function TableViewDemo() {
  return (
    <DataViewer<any>
      // data + fetching
      columns={columns} // required
      fetchData={fetchExpenseDisbursements} // required for server-side mode
      initialData={[]} // client-side mode: full dataset upfront
      preloadedData={undefined} // skip the first fetch if you already have page 1 (e.g. from SSR)
      enableServerSide={true} // false = TanStack handles filter/sort/page client-side
      initialLoadDelay={300} // artificial delay on first load (demo/skeleton purposes)
      fetchLoadDelay={100} // artificial delay on subsequent fetches
      // appearance
      variant="colored" // "default" | "bordered" | "colored"
      getRowColor={(row) =>
        row.disbursementStatus === "disbursed" ? "#fee2e2" : undefined
      } // only used when variant="colored"
      className="" // wrapper className
      title="Expense Disbursements"
      description="Testing DataViewer against the monolith backend"
      emptyStateMessage="No results found."
      children={undefined} // rendered above the toolbar (e.g. custom banner)
      // toolbar
      enableSearch={true}
      searchPlaceholder="Search..."
      enableFilters={false} // must be true AND filterOptions non-empty to show
      filterOptions={[]} // FilterOption[] — see types/common.ts
      renderFilters={undefined} // custom filter UI instead of/alongside filterOptions
      enableColumnVisibility={true}
      enableRefreshButton={true}
      refreshButtonText="Refresh"
      onRefresh={(refreshFn) => {}} // lets a parent trigger refresh externally
      // row behavior
      enableRowSelection={true}
      readOnly={false} // true disables selection entirely, even if enableRowSelection is true
      checkboxActions={[]} // CheckboxAction<T>[] — bulk action buttons
      onRowAction={(action, row) => {}} // for your own ColumnDef cell renderers to call
      // column behavior
      enableSorting={true}
      enableColumnResizing={true}
      enableColumnPinning={true} // native TanStack pin left/right, needs column.enablePinning per-column too
      // pagination
      enablePagination={true}
      pageSizeOptions={[10, 25, 50]}
      // add button
      onAddNew={() => {}}
      addButtonText="Add New"
      // persistence
      enableUrlSync={true} // syncs page/limit/keyword/filters to URL + localStorage
      storageKey="expense-disbursement-demo" // required if enableUrlSync, distinguishes multiple tables' URL params
      // multi-view (DataViewerProps, not TableViewProps)
      defaultViewType="table"
      availableViews={["table", "card", "kanban", "list"]} // table-only right now; card/kanban/list not built yet
    />
  );
}
