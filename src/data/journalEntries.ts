import type { JournalEntry } from './index';

export const journalEntries: JournalEntry[] = [
  {
    journal_id: 'JRN-OPEN-00001',
    transaction_ref: 'OPEN-2026-05',
    debit_account: '1010 - Cash',
    credit_account: "3000 - Owner's Capital",
    amount: 8000000,
    description: 'Opening cash capital for ERP prototype period',
    created_by: 'SYSTEM',
    entry_date: '2026-05-01T08:00:00Z',
    entry_type: 'CASH_ADJUSTMENT',
  },
  {
    journal_id: 'JRN-OPEN-00002',
    transaction_ref: 'OPEN-2026-05',
    debit_account: '1110 - Inventory',
    credit_account: "3000 - Owner's Capital",
    amount: 2500000,
    description: 'Opening inventory balance',
    created_by: 'SYSTEM',
    entry_date: '2026-05-01T08:05:00Z',
    entry_type: 'CASH_ADJUSTMENT',
  },
  {
    journal_id: 'JRN-OPEN-00003',
    transaction_ref: 'OPEN-2026-05',
    debit_account: '1500 - Equipment',
    credit_account: "3000 - Owner's Capital",
    amount: 12000000,
    description: 'Opening photocopy and printing equipment',
    created_by: 'SYSTEM',
    entry_date: '2026-05-01T08:10:00Z',
    entry_type: 'CASH_ADJUSTMENT',
  },
  {
    journal_id: 'JRN-EXP-00001',
    transaction_ref: 'EXP-00001',
    debit_account: '1110 - Inventory',
    credit_account: '1010 - Cash',
    amount: 175000,
    description: 'Approved expense: Restock Kertas HVS A4 80gsm',
    created_by: 'USR-00009',
    entry_date: '2026-05-14T10:05:00Z',
    entry_type: 'EXPENSE',
  },
  {
    journal_id: 'JRN-EXP-00002',
    transaction_ref: 'EXP-00002',
    debit_account: '5010 - Operating Expense - General',
    credit_account: '1010 - Cash',
    amount: 450000,
    description: 'Approved expense: Perbaikan Mesin Fotocopy Canon',
    created_by: 'USR-00009',
    entry_date: '2026-05-15T14:35:00Z',
    entry_type: 'EXPENSE',
  },
];

export const getJournalsByReference = (refId: string): JournalEntry[] => {
  return journalEntries.filter(j => j.transaction_ref === refId);
};
