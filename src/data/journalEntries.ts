import { JournalEntry } from './index';

export const journalEntries: JournalEntry[] = [
  // Entries for TXN-00001 (Total: 16.650 | Subtotal: 15.000 | Tax: 1.650)
  {
    journal_id: 'JRN-00001',
    transaction_ref: 'TXN-00001',
    debit_account: '1010 - Cash',
    credit_account: '4010 - Service Revenue',
    amount: 15000,
    created_by: 'SYSTEM',
    entry_date: '2024-05-15T09:30:00Z'
  },
  {
    journal_id: 'JRN-00002',
    transaction_ref: 'TXN-00001',
    debit_account: '1010 - Cash',
    credit_account: '2010 - Tax Payable (PPN)',
    amount: 1650,
    created_by: 'SYSTEM',
    entry_date: '2024-05-15T09:30:00Z'
  },
  
  // Entries for TXN-00002 (QRIS Payment)
  {
    journal_id: 'JRN-00003',
    transaction_ref: 'TXN-00002',
    debit_account: '1020 - Cash in Bank (QRIS)',
    credit_account: '4010 - Service Revenue',
    amount: 30000,
    created_by: 'SYSTEM',
    entry_date: '2024-05-15T10:15:00Z'
  },
  {
    journal_id: 'JRN-00004',
    transaction_ref: 'TXN-00002',
    debit_account: '1020 - Cash in Bank (QRIS)',
    credit_account: '2010 - Tax Payable (PPN)',
    amount: 3300,
    created_by: 'SYSTEM',
    entry_date: '2024-05-15T10:15:00Z'
  },

  // Entry for Approved Expense EXP-00001 (Inventory Restock)
  {
    journal_id: 'JRN-00005',
    transaction_ref: 'EXP-00001',
    debit_account: '1110 - Inventory',
    credit_account: '1010 - Cash',
    amount: 175000,
    created_by: 'USR-00009', // Owner who approved
    entry_date: '2024-05-14T10:05:00Z'
  },

  // Entry for Approved Expense EXP-00002 (Maintenance)
  {
    journal_id: 'JRN-00006',
    transaction_ref: 'EXP-00002',
    debit_account: '5010 - Maintenance Expense',
    credit_account: '1010 - Cash',
    amount: 450000,
    created_by: 'USR-00010', // Owner who approved
    entry_date: '2024-05-15T14:35:00Z'
  }
];

export const getJournalsByReference = (refId: string): JournalEntry[] => {
  return journalEntries.filter(j => j.transaction_ref === refId);
};