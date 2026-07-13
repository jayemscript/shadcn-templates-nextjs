
export interface GetAllPaginatedParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: any;
}

export interface GetAllList {
  message: string;
  data: any | null;
}

export interface ErrorResponseMessage {
  message?: string | { message?: string };
}

export interface SuccessMessageResponse {
  message?: string | { message?: string };
  expiresAt: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface BaseFields {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
  createdBy?: any | null;
  updatedBy?: any | null;
}

export interface BasePaginationResponse {
  status: string;
  message: string;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
export interface BaseResponse<T> {
  status: string;
  message: string;
  data?: T | null;
}

export interface BasePartialUpdate<T> {
  old_data?: T | null;
  new_data?: T | null;
}

export interface FormModalProps {
  open: boolean;
  close: () => void;
  onSuccess?: () => void;
  initialData?: any;
  mode?: "add" | "edit";
}

export interface AttachmentFile {
  id?: string;
  fileName: string;
  fileData: string;
  fileSize: number;
  mimeType: string;
  fileUrl?: string;
}

export enum DisbursementStatus {
  REQUESTED = "requested",
  APPROVED = "approved",
  REJECTED = "rejected",
  DISBURSED = "disbursed",
  LIQUIDATED = "liquidated",
  CLOSED = "closed",
}

export enum DisbursementType {
  CASH_ADVANCE = "cash_advance",
  DIRECT_PAYMENT = "direct_payment",
  REIMBURSEMENT = "reimbursement",
  PURCHASE_ORDER = "purchase_order",
}

export enum PaidToType {
  CLIENT_CUSTOMER = "client_customer",
  MERCHANT_VENDOR = "merchant_vendor",
  SUPPLIER = "supplier",
}

// ─── Item ────────────────────────────────────────────────────────────────────

export interface ExpenseDisbursementItemInfo extends BaseFields {
  description: string;
  amount: number;
  account: any; // full object from API
  quantity?: number | null;
  unitPrice?: number | null;
  taxRate?: any | null;
  taxAmount?: number | null;
  taxExemptAmount?: number | null;
  discountAmount?: number | null;
  inventory?: any | null; // full object in form state
}

export interface ExpenseDisbursementItemFormData {
  id?: string;
  description: string;
  quantity?: number | null;
  unitPrice?: number | null;
  taxRate?: any | null;
  taxAmount?: number | null;
  taxExemptAmount?: number | null;
  discountAmount?: number | null;
  amount: number;
  account: any | null; // full object in form state
  inventory?: any | null; // full object in form state
}

export interface ExpenseDisbursementItemPayload {
  id?: string;
  description: string;
  quantity?: number | null;
  unitPrice?: number | null;
  taxRate?: string;
  taxAmount?: number | null;
  taxExemptAmount?: number | null;
  discountAmount?: number | null;
  amount: number;
  account: string; // only id on payload — matches JSON example
  inventory?: string | null;
}

// ─── Itinerary ───────────────────────────────────────────────────────────────
// JSON example uses "date", but API internally stores as dateTime → keep dateTime
// in FormData / Payload; map "date" → "dateTime" when reading from API if needed.

export interface ItineraryItemInfo extends BaseFields {
  title: string;
  dateTime?: string; // matches JSON example key name ("date", not "dateTime")
  merchantVendor?: any | null;
  clientCustomer?: any | null;
}

export interface ItineraryItemFormData {
  id?: string;
  title: string;
  dateTime?: string; // ← fixed: was "dateTime", JSON example uses "date"
  merchantVendor?: any | null;
  clientCustomer?: any | null;
}

export interface ItineraryItemPayload {
  id?: string;
  title: string;
  dateTime?: string; // ← fixed: was "dateTime"
  merchantVendorId?: string | null;
  clientCustomerId?: string | null;
}

// ─── Main record ─────────────────────────────────────────────────────────────

export interface ExpenseDisbursementInfo extends BaseFields {
  companyBranch: any;
  cashAdvanceNo: string; // "CA#2026-0001" | "N/A"
  directPaymentNo: string; // "N/A" when not applicable
  reimbursementNo: string; // "N/A" when not applicable
  purchaseOrderNo: string; // "N/A" when not applicable
  requestedBy: any;
  paidToClientCustomer: any;
  paidToMerchantVendor: any;
  paidToSupplier: any;
  paidToType: PaidToType;
  notes?: string;
  requestedDate: string;
  purchaseOrderDate?: string | null;
  purchaseDeliveryDate?: string | null;
  purchaseDeliveryInstructions?: string | null;
  purchaseDeliveryAddress?: string | null;
  purchaseContactPerson?: string | null;
  purchaseContactNumber?: string | null;
  totalAmount: number;
  disbursementStatus: DisbursementStatus;
  disbursementType: DisbursementType;
  items: ExpenseDisbursementItemInfo[];
  itinerary: ItineraryItemInfo[];
  attachments: any[] | null; // null allowed — matches JSON example
  approvedBy?: any | null;
  rejectedBy?: any | null;
  disbursedBy?: any | null;
}

export interface GetAllPaginatedExpenseDisbursement extends BasePaginationResponse {
  expense_disbursement_data: ExpenseDisbursementInfo[];
}

// ─── Form state ──────────────────────────────────────────────────────────────

export interface ExpenseDisbursementFormData {
  id?: string;
  companyBranch: any | null;
  cashAdvanceNo: string;
  directPaymentNo: string;
  reimbursementNo: string;
  purchaseOrderNo: string;
  requestedBy: any | null; // null before user picks someone
  paidToClientCustomer?: any | null;
  paidToMerchantVendor?: any | null;
  paidToSupplier?: any | null;
  paidToType?: PaidToType | null;
  purchaseOrderDate?: string | null;
  purchaseDeliveryDate?: string | null;
  purchaseDeliveryInstructions?: string | null;
  purchaseDeliveryAddress?: string | null;
  purchaseContactPerson?: string | null;
  purchaseContactNumber?: string | null;
  notes?: string;
  requestedDate: string;
  disbursementType: DisbursementType | null; // null before type is selected
  items: ExpenseDisbursementItemFormData[];
  itinerary?: ItineraryItemFormData[];
  attachments?: any[] | null;
  removeAttachmentIds?: string[];
}

// ─── API payloads ────────────────────────────────────────────────────────────

export interface ExpenseDisbursementPayload {
  companyBranch: string;
  cashAdvanceNo: string; // filled value or "N/A"
  directPaymentNo: string;
  reimbursementNo: string;
  purchaseOrderNo: string;
  requestedBy: string; // uuid — matches JSON example
  paidToClientCustomer?: string;
  paidToMerchantVendor?: string;
  paidToSupplier?: string;
  paidToType?: PaidToType;
  purchaseOrderDate?: string | null;
  purchaseDeliveryDate?: string | null;
  purchaseDeliveryInstructions?: string | null;
  purchaseDeliveryAddress?: string | null;
  purchaseContactPerson?: string | null;
  purchaseContactNumber?: string | null;
  notes?: string;
  requestedDate: string;
  totalAmount: number;
  disbursementStatus?: DisbursementStatus; // optional; backend defaults to "requested"
  disbursementType: DisbursementType;
  items: ExpenseDisbursementItemPayload[];
  itinerary?: ItineraryItemPayload[];
  attachments?: any[] | null;
  // edit-only delta fields
  createItems?: ExpenseDisbursementItemPayload[];
  updateItems?: (ExpenseDisbursementItemPayload & { id: string })[];
  removeItemIds?: string[];
  createItinerary?: ItineraryItemPayload[];
  updateItinerary?: (ItineraryItemPayload & { id: string })[];
  removeItineraryIds?: string[];
  removeAttachmentIds?: string[];
}
