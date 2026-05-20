import { type JournalEntry, type Transaction } from '../data/index';

type AccountMapping = {
  cash: string;
  cashInBank: string;
  taxPayable: string;
  revenue: string;
};

export const defaultAccountMapping: AccountMapping = {
  cash: '1010 - Cash',
  cashInBank: '1020 - Cash in Bank (QRIS)',
  taxPayable: '2010 - Tax Payable (PPN)',
  revenue: '4010 - Service Revenue',
};

export function generateSalesJournalEntries(args: {
  txnId: string;
  paymentMethod: Transaction['payment_method'];
  subtotal: number;
  taxAmount: number;
  createdBy: string;
  entryDateISO: string;
  accounts?: Partial<AccountMapping>;
}): JournalEntry[] {
  const accounts = { ...defaultAccountMapping, ...(args.accounts ?? {}) };

  const cashDebitAccount =
    args.paymentMethod === 'CASH' ? accounts.cash : args.paymentMethod === 'DEBIT' ? accounts.cashInBank : accounts.cashInBank;

  const entries: JournalEntry[] = [
    {
      journal_id: `JRN-${Date.now()}-1-${Math.floor(Math.random() * 1000)}`,
      transaction_ref: args.txnId,
      debit_account: cashDebitAccount,
      credit_account: accounts.revenue,
      amount: args.subtotal,
      created_by: args.createdBy,
      entry_date: args.entryDateISO,
    },
    {
      journal_id: `JRN-${Date.now()}-2-${Math.floor(Math.random() * 1000)}`,
      transaction_ref: args.txnId,
      debit_account: cashDebitAccount,
      credit_account: accounts.taxPayable,
      amount: args.taxAmount,
      created_by: args.createdBy,
      entry_date: args.entryDateISO,
    },
  ];

  return entries;
}

