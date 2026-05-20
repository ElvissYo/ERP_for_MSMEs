// ============================================================================
// CHART OF ACCOUNTS - WOYLA PHOTOCOPY
// Standar Akuntansi yang Realistis untuk UMKM
// ============================================================================

import { ChartOfAccount } from '../types';

export const chartOfAccounts: ChartOfAccount[] = [
  // ========== ASSETS (1000-1999) ==========
  
  // Current Assets (1000-1499)
  {
    account_code: '1010',
    account_name: 'Cash',
    account_type: 'ASSET',
    account_category: 'CURRENT_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '1020',
    account_name: 'Cash in Bank',
    account_type: 'ASSET',
    account_category: 'CURRENT_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '1100',
    account_name: 'Accounts Receivable',
    account_type: 'ASSET',
    account_category: 'CURRENT_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '1200',
    account_name: 'Inventory - Raw Materials',
    account_type: 'ASSET',
    account_category: 'CURRENT_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '1210',
    account_name: 'Inventory - Office Supplies',
    account_type: 'ASSET',
    account_category: 'CURRENT_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '1300',
    account_name: 'Prepaid Expenses',
    account_type: 'ASSET',
    account_category: 'CURRENT_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },

  // Fixed Assets (1500-1999)
  {
    account_code: '1500',
    account_name: 'Equipment',
    account_type: 'ASSET',
    account_category: 'FIXED_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '1510',
    account_name: 'Accumulated Depreciation - Equipment',
    account_type: 'ASSET',
    account_category: 'FIXED_ASSET',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '1600',
    account_name: 'Furniture & Fixtures',
    account_type: 'ASSET',
    account_category: 'FIXED_ASSET',
    normal_balance: 'DEBIT',
    is_active: true,
  },

  // ========== LIABILITIES (2000-2999) ==========
  
  // Current Liabilities (2000-2499)
  {
    account_code: '2010',
    account_name: 'Accounts Payable',
    account_type: 'LIABILITY',
    account_category: 'CURRENT_LIABILITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '2100',
    account_name: 'Tax Payable - PPN (VAT)',
    account_type: 'LIABILITY',
    account_category: 'CURRENT_LIABILITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '2110',
    account_name: 'Tax Payable - PPh 21',
    account_type: 'LIABILITY',
    account_category: 'CURRENT_LIABILITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '2200',
    account_name: 'Accrued Expenses',
    account_type: 'LIABILITY',
    account_category: 'CURRENT_LIABILITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '2300',
    account_name: 'Unearned Revenue',
    account_type: 'LIABILITY',
    account_category: 'CURRENT_LIABILITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },

  // Long-term Liabilities (2500-2999)
  {
    account_code: '2500',
    account_name: 'Long-term Debt',
    account_type: 'LIABILITY',
    account_category: 'LONG_TERM_LIABILITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },

  // ========== EQUITY (3000-3999) ==========
  {
    account_code: '3000',
    account_name: 'Owner\'s Capital',
    account_type: 'EQUITY',
    account_category: 'EQUITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '3100',
    account_name: 'Retained Earnings',
    account_type: 'EQUITY',
    account_category: 'EQUITY',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '3200',
    account_name: 'Owner\'s Drawings',
    account_type: 'EQUITY',
    account_category: 'EQUITY',
    normal_balance: 'DEBIT',
    is_active: true,
  },

  // ========== REVENUE (4000-4999) ==========
  {
    account_code: '4000',
    account_name: 'Service Revenue - Printing',
    account_type: 'REVENUE',
    account_category: 'OPERATING_REVENUE',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '4010',
    account_name: 'Service Revenue - Binding',
    account_type: 'REVENUE',
    account_category: 'OPERATING_REVENUE',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '4020',
    account_name: 'Service Revenue - Laminating',
    account_type: 'REVENUE',
    account_category: 'OPERATING_REVENUE',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '4030',
    account_name: 'Service Revenue - Photo Service',
    account_type: 'REVENUE',
    account_category: 'OPERATING_REVENUE',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '4040',
    account_name: 'Service Revenue - Other',
    account_type: 'REVENUE',
    account_category: 'OPERATING_REVENUE',
    normal_balance: 'CREDIT',
    is_active: true,
  },
  {
    account_code: '4900',
    account_name: 'Other Income',
    account_type: 'REVENUE',
    account_category: 'NON_OPERATING_REVENUE',
    normal_balance: 'CREDIT',
    is_active: true,
  },

  // ========== EXPENSES (5000-5999) ==========
  
  // Cost of Goods Sold
  {
    account_code: '5000',
    account_name: 'Cost of Goods Sold (COGS)',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },

  // Operating Expenses
  {
    account_code: '5100',
    account_name: 'Salaries & Wages',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5200',
    account_name: 'Rent Expense',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5300',
    account_name: 'Utilities Expense',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5400',
    account_name: 'Maintenance & Repairs',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5500',
    account_name: 'Marketing & Advertising',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5600',
    account_name: 'Office Supplies Expense',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5700',
    account_name: 'Depreciation Expense',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5800',
    account_name: 'Insurance Expense',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5850',
    account_name: 'Cash Short and Over',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '5900',
    account_name: 'Miscellaneous Expense',
    account_type: 'EXPENSE',
    account_category: 'OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },

  // Non-Operating Expenses
  {
    account_code: '6000',
    account_name: 'Interest Expense',
    account_type: 'EXPENSE',
    account_category: 'NON_OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
  {
    account_code: '6100',
    account_name: 'Loss on Asset Disposal',
    account_type: 'EXPENSE',
    account_category: 'NON_OPERATING_EXPENSE',
    normal_balance: 'DEBIT',
    is_active: true,
  },
];

// Helper Functions
export const getAccountByCode = (code: string): ChartOfAccount | undefined => {
  return chartOfAccounts.find(acc => acc.account_code === code);
};

export const getAccountsByType = (type: string): ChartOfAccount[] => {
  return chartOfAccounts.filter(acc => acc.account_type === type);
};

export const getAccountName = (code: string): string => {
  const account = getAccountByCode(code);
  return account ? account.account_name : 'Unknown Account';
};

// Revenue account mapping berdasarkan service category
export const getRevenueAccountByCategory = (category: string): string => {
  const mapping: { [key: string]: string } = {
    'Printing': '4000',
    'Binding': '4010',
    'Laminating': '4020',
    'Photo Service': '4030',
    'Scanning': '4040',
    'Design & Editing': '4040',
    'Other Services': '4040',
  };
  return mapping[category] || '4040';
};
