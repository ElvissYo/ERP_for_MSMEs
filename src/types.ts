// ============================================================================
// ENHANCED TYPES FOR WOYLA PHOTOCOPY AIS
// President University - Information Systems (Data Science)
// ============================================================================

// Base Types
export type UserRole = 'CASHIER' | 'OWNER';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'VOIDED';
export type ServiceStatus = 'ACTIVE' | 'INACTIVE';
export type InventoryStatus = 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PurchaseOrderStatus = 'DRAFT' | 'AWAITING_DELIVERY' | 'RECEIVED' | 'PAID';
export type TransactionItemType = 'SERVICE' | 'PRODUCT';

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE_TRANSACTION' 
  | 'VOID_TRANSACTION'
  | 'UPDATE_INVENTORY' 
  | 'APPROVE_EXPENSE'
  | 'REJECT_EXPENSE'
  | 'CREATE_EXPENSE'
  | 'CREATE_GENERAL_JOURNAL'
  | 'VIEW_REPORT'
  | 'EXPORT_DATA'
  | 'GENERATE_PO'
  | 'RECEIVE_GOODS'
  | 'PAY_BILL'
  | 'CLOSE_SHIFT';

// Chart of Accounts Types
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type AccountCategory = 
  | 'CURRENT_ASSET' 
  | 'FIXED_ASSET' 
  | 'CURRENT_LIABILITY' 
  | 'LONG_TERM_LIABILITY' 
  | 'EQUITY' 
  | 'OPERATING_REVENUE' 
  | 'NON_OPERATING_REVENUE' 
  | 'OPERATING_EXPENSE' 
  | 'NON_OPERATING_EXPENSE';

export interface ChartOfAccount {
  account_code: string;
  account_name: string;
  account_type: AccountType;
  account_category: AccountCategory;
  normal_balance: 'DEBIT' | 'CREDIT';
  is_active: boolean;
}

// User Interface
export interface User {
  user_id: string;
  full_name: string;
  username: string;
  password: string;
  pin?: string; // For authorization (Owner PIN)
  role: UserRole;
  phone_number: string;
  created_at: string;
  account_status: AccountStatus;
}

// Service Interface
export interface Service {
  service_id: string;
  service_name: string;
  category: string;
  unit_price: number;
  service_status: ServiceStatus;
  created_at: string;
  // Mapping untuk COGS
  cogs_mapping?: {
    inventory_id: string;
    quantity_per_unit: number; // Berapa banyak inventory digunakan per 1 unit service
  }[];
}

// Inventory Interface
export interface Inventory {
  inventory_id: string;
  item_name: string;
  category: string;
  stock: number;
  reorder_point: number;
  unit_cost: number;
  supplier_name: string;
  inventory_status: InventoryStatus;
  last_restock_date: string;
}

export interface TransactionLineItem {
  item_type: TransactionItemType;
  service_id?: string;
  product_id?: string;
  inventory_id?: string;
  item_name?: string;
  quantity: number;
  unit_price?: number;
  unit_cost?: number;
  service?: Service;
  inventory?: Inventory;
}

// Transaction Interface (Enhanced)
export interface Transaction {
  transaction_id: string;
  cashier_id: string;
  service_id: string;
  quantity: number;
  subtotal: number;
  tax_amount: number; // PPN 11%
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_date: string;
  items?: TransactionLineItem[];
  cart_items?: TransactionLineItem[];
  voided_by?: string;
  voided_at?: string;
  void_reason?: string;
}

// Expense Interface
export interface Expense {
  expense_id: string;
  expense_name: string;
  category: string;
  amount: number;
  submitted_by: string;
  approved_by: string | null;
  expense_date: string;
  approval_status: ApprovalStatus;
}

// Journal Entry Interface (Enhanced - Double Entry)
export interface JournalEntry {
  journal_id: string;
  transaction_ref: string; // Reference ke transaction_id / expense_id / PO_id
  debit_account: string; // Account Code
  credit_account: string; // Account Code
  amount: number;
  description?: string;
  created_by: string;
  entry_date: string;
  entry_type?: 'SALES' | 'COGS' | 'PROCUREMENT' | 'EXPENSE' | 'CASH_ADJUSTMENT' | 'TAX';
}

// Audit Trail Interface
export interface AuditTrail {
  audit_id: string;
  user_id: string;
  action: AuditAction;
  module: string;
  target_id: string | null;
  timestamp: string;
  ip_address: string;
  details?: string; // Additional context
}

// Purchase Order Interface
export interface PurchaseOrder {
  po_id: string;
  supplier_name: string;
  items: {
    inventory_id: string;
    item_name: string;
    quantity: number;
    unit_cost: number;
    subtotal: number;
  }[];
  total_amount: number;
  status: PurchaseOrderStatus;
  created_by: string;
  created_at: string;
  received_at?: string;
  paid_at?: string;
}

// Shift Reconciliation Interface
export interface ShiftReconciliation {
  shift_id: string;
  cashier_id: string;
  start_time: string;
  end_time: string;
  expected_cash: number; // Dari sistem
  actual_cash: number; // Input kasir
  cash_difference: number; // actual - expected
  transaction_count: number;
  notes?: string;
}

// Role-based Permissions
export interface RolePermissions {
  canCreateTransaction: boolean;
  canVoidTransaction: boolean;
  canViewTransactions: boolean;
  canViewReports: boolean;
  canManageInventory: boolean;
  canApproveExpenses: boolean;
  canViewFinancials: boolean;
  canViewAuditTrail: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canGeneratePO: boolean;
  canReceiveGoods: boolean;
  canPayBills: boolean;
}

// Analytics & Predictive Interfaces
export interface DemandForecast {
  inventory_id: string;
  item_name: string;
  current_stock: number;
  avg_daily_usage: number;
  estimated_days_remaining: number;
  reorder_recommendation: boolean;
}

export interface AnomalyDetection {
  anomaly_id: string;
  type: 'AFTER_HOURS' | 'HIGH_VALUE' | 'VOIDED_TRANSACTION' | 'UNUSUAL_PATTERN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  transaction_id?: string;
  description: string;
  detected_at: string;
  reviewed: boolean;
}

// Trial Balance Interface
export interface TrialBalanceEntry {
  account_code: string;
  account_name: string;
  account_type: AccountType;
  debit_balance: number;
  credit_balance: number;
}

// Financial Report Interfaces
export interface IncomeStatement {
  period: string;
  gross_revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expenses: number;
  net_income: number;
}

export interface BalanceSheet {
  as_of_date: string;
  assets: {
    current_assets: number;
    fixed_assets: number;
    total_assets: number;
  };
  liabilities: {
    current_liabilities: number;
    long_term_liabilities: number;
    total_liabilities: number;
  };
  equity: {
    retained_earnings: number;
    total_equity: number;
  };
}
