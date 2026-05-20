import { Expense } from './index';

export const expenses: Expense[] = [
  {
    expense_id: 'EXP-00001',
    expense_name: 'Restock Kertas HVS A4 80gsm (5 Ream)',
    category: 'Inventory Restock',
    amount: 175000,
    submitted_by: 'USR-00001', // Rina (Cashier)
    approved_by: 'USR-00009', // Bambang (Owner)
    expense_date: '2024-05-14T10:00:00Z',
    approval_status: 'APPROVED'
  },
  {
    expense_id: 'EXP-00002',
    expense_name: 'Perbaikan Mesin Fotocopy Canon',
    category: 'Maintenance',
    amount: 450000,
    submitted_by: 'USR-00004', // Ahmad (Cashier)
    approved_by: 'USR-00010', // Linda (Owner)
    expense_date: '2024-05-15T14:30:00Z',
    approval_status: 'APPROVED'
  },
  {
    expense_id: 'EXP-00003',
    expense_name: 'Pembelian Tinta Epson Black (2 pcs)',
    category: 'Inventory Restock',
    amount: 370000,
    submitted_by: 'USR-00002', // Budi (Cashier)
    approved_by: null,
    expense_date: '2024-05-17T09:00:00Z',
    approval_status: 'PENDING'
  },
  {
    expense_id: 'EXP-00004',
    expense_name: 'Makan Siang Tim',
    category: 'Meals & Entertainment',
    amount: 150000,
    submitted_by: 'USR-00003', // Siti (Cashier)
    approved_by: 'USR-00009', // Bambang (Owner)
    expense_date: '2024-05-16T12:00:00Z',
    approval_status: 'REJECTED' // Ditolak karena bukan pengeluaran bisnis
  }
];

// Helper functions
export const getExpenseById = (expenseId: string): Expense | undefined => {
  return expenses.find(e => e.expense_id === expenseId);
};

export const getExpensesByStatus = (status: string): Expense[] => {
  return expenses.filter(e => e.approval_status === status);
};

export const calculateTotalApprovedExpenses = (): number => {
  return expenses.filter(e => e.approval_status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);
};