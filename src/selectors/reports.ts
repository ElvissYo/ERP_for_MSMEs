import { type JournalEntry, type Inventory, type Expense, type Transaction } from '../data/index';

export function calculateIncomeStatement(args: {
  transactions: Transaction[];
  journalEntries: JournalEntry[];
  expenses: Expense[];
  dateFrom?: string;
  dateTo?: string;
}): {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
} {
  const from = args.dateFrom ? new Date(args.dateFrom).getTime() : -Infinity;
  const to = args.dateTo ? new Date(args.dateTo).getTime() : Infinity;

  const revenue = args.transactions
    .filter((t) => t.payment_status === 'PAID')
    .filter((t) => {
      const ts = new Date(t.transaction_date).getTime();
      return ts >= from && ts <= to;
    })
    .reduce((sum, t) => sum + t.subtotal, 0);

  const expense = args.expenses
    .filter((e) => e.approval_status === 'APPROVED')
    .filter((e) => {
      const ts = new Date(e.expense_date).getTime();
      return ts >= from && ts <= to;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return { totalRevenue: revenue, totalExpense: expense, netProfit: revenue - expense };
}

export function getTotalInventoryValue(args: { inventory: Inventory[] }): number {
  return args.inventory.reduce((total, item) => total + item.stock * item.unit_cost, 0);
}

