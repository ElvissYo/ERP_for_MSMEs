import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  type Inventory,
  type Expense,
  type JournalEntry,
  type Transaction,
  type AuditTrail,
  type UserRole,
  type PurchaseOrder,
} from '../data/index';
import { transactions as seedTransactions } from '../data/transactions';
import { journalEntries as seedJournalEntries } from '../data/journalEntries';
import { inventory as seedInventory } from '../data/inventory';
import { expenses as seedExpenses } from '../data/expenses';
import { auditTrail as seedAuditTrail } from '../data/auditTrail';
import { services } from '../data/services';

export type ActionName =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_TRANSACTION'
  | 'UPDATE_INVENTORY'
  | 'CREATE_EXPENSE'
  | 'APPROVE_EXPENSE'
  | 'REJECT_EXPENSE'
  | 'VIEW_REPORT'
  | 'VIEW_LEDGER'
  | 'EXPORT_DATA'
  | 'GENERATE_PO'
  | 'RECEIVE_GOODS'
  | 'PAY_BILL'
  | 'VOID_TRANSACTION'
  | 'CLOSE_SHIFT';

type TransactionLineItem = {
  service_id: string;
  quantity: number;
  unit_price?: number;
};

type TransactionInput = Transaction & {
  // Optional supaya nanti kalau POS kamu sudah support multi item,
  // AppContext ini tetap bisa deduct inventory per item, bukan cuma item pertama.
  items?: Array<Partial<TransactionLineItem> & { service?: { service_id?: string; unit_price?: number } }>;
  cart_items?: Array<Partial<TransactionLineItem> & { service?: { service_id?: string; unit_price?: number } }>;
};

export type AppContextState = {
  role: UserRole;
  auditTrail: AuditTrail[];
  transactions: Transaction[];
  journalEntries: JournalEntry[];
  inventory: Inventory[];
  expenses: Expense[];
  purchaseOrders: PurchaseOrder[];

  // actions (event-driven)
  setRole: (role: UserRole) => void;
  pushAudit: (args: { userId: string; action: ActionName; module: string; targetId?: string | null; details?: string }) => void;

  addTransaction: (txn: TransactionInput) => void;
  addJournalEntries: (entries: JournalEntry[]) => void;
  deductInventory: (inventoryId: string, qty: number) => void;
  addInventory: (item: Inventory) => void;
  updateInventory: (item: Inventory) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;

  approveExpense: (expenseId: string, approvedBy: string) => void;
  rejectExpense: (expenseId: string, rejectedBy: string) => void;
  generatePO: (po: any) => void;
  receiveGoods: (poId: string, userId: string) => void;
  payBill: (poId: string, userId: string) => void;
  getDemandForecasts: () => any[];
  voidTransaction: (transactionId: string, reason: string, userId: string) => void;
  closeShift: (data: any) => void;
};

const AppContext = createContext<AppContextState | undefined>(undefined);

const STORAGE_KEYS = {
  transactions: 'woyla_erp_transactions',
  journalEntries: 'woyla_erp_journal_entries',
  inventory: 'woyla_erp_inventory',
  expenses: 'woyla_erp_expenses',
  purchaseOrders: 'woyla_erp_purchase_orders',
  auditTrail: 'woyla_erp_audit_trail',
} as const;

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const cloneData = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

const loadArrayFromStorage = <T,>(key: string, fallback: T[]): T[] => {
  if (!isBrowser()) return cloneData(fallback);

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return cloneData(fallback);

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : cloneData(fallback);
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage. Using seed data instead.`, error);
    return cloneData(fallback);
  }
};

const saveArrayToStorage = <T,>(key: string, value: T[]) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage.`, error);
  }
};

const getInventoryStatus = (stock: number, reorderPoint: number): Inventory['inventory_status'] => {
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= reorderPoint) return 'LOW_STOCK';
  return 'NORMAL';
};

const normalizeInventoryItem = (item: Inventory, stock = item.stock): Inventory => ({
  ...item,
  stock: Math.max(0, Number(stock) || 0),
  inventory_status: getInventoryStatus(Math.max(0, Number(stock) || 0), item.reorder_point),
});

const getDebitAccountByPaymentMethod = (paymentMethod: Transaction['payment_method']) => {
  if (paymentMethod === 'CASH') return '1010 - Cash';
  return '1020 - Cash in Bank';
};

const getRevenueAccountByServiceId = (serviceId: string) => {
  const service = services.find((svc) => svc.service_id === serviceId);
  const category = service?.category ?? '';

  if (category === 'Printing' || category === 'Fotocopy') return '4000 - Service Revenue - Printing';
  if (category === 'Binding') return '4010 - Service Revenue';
  if (category === 'Laminating') return '4020 - Service Revenue - Laminating';
  if (category === 'Photo Service') return '4030 - Service Revenue - Photo Service';
  return '4040 - Service Revenue - Other';
};

const normalizeJournalAccount = (account: string) => {
  if (/^2010/i.test(account) && /tax|ppn|vat/i.test(account)) return '2100 - Tax Payable (PPN)';
  if (/^1020/i.test(account)) return '1020 - Cash in Bank';
  return account;
};

const normalizeJournalEntry = (entry: JournalEntry): JournalEntry => ({
  ...entry,
  debit_account: normalizeJournalAccount(entry.debit_account),
  credit_account: normalizeJournalAccount(entry.credit_account),
});

const getTransactionLineItems = (txn: TransactionInput): TransactionLineItem[] => {
  const rawItems = txn.items ?? txn.cart_items;

  if (Array.isArray(rawItems) && rawItems.length > 0) {
    return rawItems
      .map((item) => ({
        service_id: item.service_id ?? item.service?.service_id ?? '',
        quantity: Number(item.quantity ?? 1),
        unit_price: item.unit_price ?? item.service?.unit_price,
      }))
      .filter((item) => item.service_id && item.quantity > 0);
  }

  return [{ service_id: txn.service_id, quantity: Number(txn.quantity || 1) }];
};

const getPackageUnitCount = (itemName: string) => {
  const lowerName = itemName.toLowerCase();
  const explicitUnits = lowerName.match(/(?:pack|box)\s+(\d+)/i);
  if (explicitUnits) return Number(explicitUnits[1]);
  if (lowerName.includes('ream')) return 500;
  if (lowerName.includes('pack')) return 100;
  if (lowerName.includes('box')) return 100;
  return 1;
};

const getMaterialUnitCost = (item: Inventory) => {
  return item.unit_cost / getPackageUnitCount(item.item_name);
};

const generateSalesJournalEntries = (txn: TransactionInput): JournalEntry[] => {
  if (txn.payment_status !== 'PAID') return [];

  const entryDate = txn.transaction_date || new Date().toISOString();
  const debitAccount = getDebitAccountByPaymentMethod(txn.payment_method);
  const lines = getTransactionLineItems(txn);
  const revenueByAccount = new Map<string, number>();

  lines.forEach((line) => {
    const amount = line.unit_price ? Math.round(line.unit_price * line.quantity) : 0;
    const account = getRevenueAccountByServiceId(line.service_id);
    revenueByAccount.set(account, (revenueByAccount.get(account) ?? 0) + amount);
  });

  if (Array.from(revenueByAccount.values()).reduce((sum, amount) => sum + amount, 0) !== txn.subtotal) {
    revenueByAccount.clear();
    revenueByAccount.set(getRevenueAccountByServiceId(txn.service_id), txn.subtotal);
  }

  const entries: JournalEntry[] = Array.from(revenueByAccount.entries()).map(([revenueAccount, amount], index) => ({
    journal_id: `JRN-SALES-${txn.transaction_id}-${index}-${Date.now()}`,
    transaction_ref: txn.transaction_id,
    debit_account: debitAccount,
    credit_account: revenueAccount,
    amount,
    description: 'POS sales revenue recognition',
    created_by: txn.cashier_id,
    entry_date: entryDate,
    entry_type: 'SALES',
  }));

  if (txn.tax_amount > 0) {
    entries.push({
      journal_id: `JRN-TAX-${txn.transaction_id}-${Date.now()}`,
      transaction_ref: txn.transaction_id,
      debit_account: debitAccount,
      credit_account: '2100 - Tax Payable (PPN)',
      amount: txn.tax_amount,
      description: 'PPN payable from POS sales',
      created_by: txn.cashier_id,
      entry_date: entryDate,
      entry_type: 'TAX',
    });
  }

  return entries;
};

const generateCOGSJournalEntries = (args: {
  txn: TransactionInput;
  currentInventory: Inventory[];
}): JournalEntry[] => {
  if (args.txn.payment_status !== 'PAID') return [];

  const entryDate = args.txn.transaction_date || new Date().toISOString();
  const lines = getTransactionLineItems(args.txn);
  const entries: JournalEntry[] = [];

  lines.forEach((line, lineIndex) => {
    const service = services.find((svc) => svc.service_id === line.service_id);
    if (!service?.cogs_mapping?.length) return;

    service.cogs_mapping.forEach((mapping, mappingIndex) => {
      const item = args.currentInventory.find((inv) => inv.inventory_id === mapping.inventory_id);
      if (!item) return;

      const usedQty = Number(mapping.quantity_per_unit || 0) * line.quantity;
      const amount = Math.round(usedQty * getMaterialUnitCost(item));
      if (amount <= 0) return;

      entries.push({
        journal_id: `JRN-COGS-${args.txn.transaction_id}-${lineIndex}-${mappingIndex}-${Date.now()}`,
        transaction_ref: args.txn.transaction_id,
        debit_account: '5020 - Cost of Goods Sold',
        credit_account: '1110 - Inventory',
        amount,
        description: `COGS for ${service.service_name} using ${item.item_name}`,
        created_by: args.txn.cashier_id,
        entry_date: entryDate,
        entry_type: 'COGS',
      });
    });
  });

  return entries;
};

const journalSignature = (entry: JournalEntry) =>
  [
    entry.transaction_ref,
    normalizeJournalAccount(entry.debit_account),
    normalizeJournalAccount(entry.credit_account),
    Number(entry.amount),
  ].join('|');

const mergeJournalEntries = (prev: JournalEntry[], incoming: JournalEntry[]) => {
  const existing = new Set(prev.map(journalSignature));
  const cleanIncoming = incoming.filter((entry) => {
    const signature = journalSignature(entry);
    if (existing.has(signature)) return false;
    existing.add(signature);
    return true;
  });

  return cleanIncoming.length ? [...prev, ...cleanIncoming] : prev;
};

export const AppProvider = ({
  children,
  initialRole = 'CASHIER',
}: {
  children: React.ReactNode;
  initialRole?: UserRole;
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);

  // Lazy initialization: dibaca sekali saat AppProvider pertama kali mount.
  // Kalau localStorage kosong/rusak, fallback ke seed data.
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>(() => loadArrayFromStorage(STORAGE_KEYS.auditTrail, seedAuditTrail));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadArrayFromStorage(STORAGE_KEYS.transactions, seedTransactions));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    loadArrayFromStorage(STORAGE_KEYS.journalEntries, seedJournalEntries).map(normalizeJournalEntry),
  );
  const [inventory, setInventory] = useState<Inventory[]>(() => loadArrayFromStorage(STORAGE_KEYS.inventory, seedInventory));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadArrayFromStorage(STORAGE_KEYS.expenses, seedExpenses));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadArrayFromStorage(STORAGE_KEYS.purchaseOrders, []));

  // Auto persist setiap state utama berubah.
  useEffect(() => saveArrayToStorage(STORAGE_KEYS.auditTrail, auditTrail), [auditTrail]);
  useEffect(() => saveArrayToStorage(STORAGE_KEYS.transactions, transactions), [transactions]);
  useEffect(() => saveArrayToStorage(STORAGE_KEYS.journalEntries, journalEntries), [journalEntries]);
  useEffect(() => saveArrayToStorage(STORAGE_KEYS.inventory, inventory), [inventory]);
  useEffect(() => saveArrayToStorage(STORAGE_KEYS.expenses, expenses), [expenses]);
  useEffect(() => saveArrayToStorage(STORAGE_KEYS.purchaseOrders, purchaseOrders), [purchaseOrders]);

  useEffect(() => {
    const generatedEntries = transactions.flatMap((txn) => [
      ...generateSalesJournalEntries(txn),
      ...generateCOGSJournalEntries({ txn, currentInventory: inventory }),
    ]);

    setJournalEntries((prev) =>
      mergeJournalEntries(
        prev.map(normalizeJournalEntry).filter((entry) => !entry.transaction_ref.startsWith('TXN-')),
        generatedEntries.map(normalizeJournalEntry),
      ),
    );
  }, []);

  const pushAudit = ({
    userId,
    action,
    module,
    targetId = null,
    details,
  }: {
    userId: string;
    action: ActionName;
    module: string;
    targetId?: string | null;
    details?: string;
  }) => {
    const entry: AuditTrail = {
      audit_id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      action: action as any,
      module,
      target_id: targetId,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1',
      details,
    };

    setAuditTrail((prev: AuditTrail[]) => [entry, ...prev]);
  };

  const addJournalEntries = (entries: JournalEntry[]) => {
    if (!entries.length) return;
    setJournalEntries((prev: JournalEntry[]) =>
      mergeJournalEntries(prev.map(normalizeJournalEntry), entries.map(normalizeJournalEntry)),
    );
  };

  const deductInventory = (inventoryId: string, qty: number) => {
    setInventory((prev: Inventory[]) =>
      prev.map((item: Inventory) =>
        item.inventory_id === inventoryId ? normalizeInventoryItem(item, item.stock - qty) : item,
      ),
    );
  };

  const deductInventoryByTransaction = (txn: TransactionInput) => {
    if (txn.payment_status !== 'PAID') return;

    const lines = getTransactionLineItems(txn);

    setInventory((prev: Inventory[]) =>
      prev.map((item: Inventory) => {
        const totalDeduction = lines.reduce((sum, line) => {
          const service = services.find((svc) => svc.service_id === line.service_id);
          const mapping = service?.cogs_mapping?.find((map) => map.inventory_id === item.inventory_id);
          if (!mapping) return sum;
          return sum + Number(mapping.quantity_per_unit || 0) * line.quantity;
        }, 0);

        return totalDeduction > 0 ? normalizeInventoryItem(item, item.stock - totalDeduction) : item;
      }),
    );
  };

  const restoreInventoryByTransaction = (txn: TransactionInput) => {
    const lines = getTransactionLineItems(txn);

    setInventory((prev: Inventory[]) =>
      prev.map((item: Inventory) => {
        const totalRestore = lines.reduce((sum, line) => {
          const service = services.find((svc) => svc.service_id === line.service_id);
          const mapping = service?.cogs_mapping?.find((map) => map.inventory_id === item.inventory_id);
          if (!mapping) return sum;
          return sum + Number(mapping.quantity_per_unit || 0) * line.quantity;
        }, 0);

        return totalRestore > 0 ? normalizeInventoryItem(item, item.stock + totalRestore) : item;
      }),
    );
  };

  const addTransaction = (txn: TransactionInput) => {
    const alreadyExists = transactions.some((item) => item.transaction_id === txn.transaction_id);
    if (alreadyExists) return;

    setTransactions((prev: Transaction[]) => [...prev, txn]);

    // Flow otomatis POS:
    // 1. Transaksi masuk
    // 2. Inventory terpotong berdasarkan cogs_mapping service
    // 3. Journal double-entry otomatis dibuat: Sales, Tax, dan COGS
    deductInventoryByTransaction(txn);
    addJournalEntries([
      ...generateSalesJournalEntries(txn),
      ...generateCOGSJournalEntries({ txn, currentInventory: inventory }),
    ]);

    pushAudit({
      userId: txn.cashier_id,
      action: 'CREATE_TRANSACTION',
      module: 'POS',
      targetId: txn.transaction_id,
      details: `Transaction created with total Rp ${txn.total_amount.toLocaleString('id-ID')}`,
    });
  };

  const addInventory = (item: Inventory) => {
    setInventory((prev: Inventory[]) => [normalizeInventoryItem(item), ...prev]);
  };

  const updateInventory = (item: Inventory) => {
    setInventory((prev: Inventory[]) =>
      prev.map((current) => (current.inventory_id === item.inventory_id ? normalizeInventoryItem(item) : current)),
    );
  };

  const addExpense = (expense: Expense) => {
    setExpenses((prev: Expense[]) => [expense, ...prev]);
    pushAudit({ userId: expense.submitted_by, action: 'CREATE_EXPENSE', module: 'EXPENSES', targetId: expense.expense_id });
  };

  const updateExpense = (expense: Expense) => {
    setExpenses((prev: Expense[]) => prev.map((current) => (current.expense_id === expense.expense_id ? expense : current)));
  };

  const approveExpense = (expenseId: string, approvedBy: string) => {
    const exp = expenses.find((expense) => expense.expense_id === expenseId);
    if (!exp || exp.approval_status === 'APPROVED') return;

    const isInventoryExpense = exp.category.toLowerCase().includes('inventory');

    addJournalEntries([
      {
        journal_id: `JRN-EXP-${expenseId}-${Date.now()}`,
        transaction_ref: expenseId,
        debit_account: isInventoryExpense ? '1110 - Inventory' : '5010 - Operating Expense',
        credit_account: '1010 - Cash',
        amount: exp.amount,
        description: `Approved expense: ${exp.expense_name}`,
        created_by: approvedBy,
        entry_date: new Date().toISOString(),
        entry_type: 'EXPENSE',
      },
    ]);

    setExpenses((prev: Expense[]) =>
      prev.map((expense: Expense) =>
        expense.expense_id === expenseId ? { ...expense, approval_status: 'APPROVED', approved_by: approvedBy } : expense,
      ),
    );

    pushAudit({ userId: approvedBy, action: 'APPROVE_EXPENSE', module: 'EXPENSES', targetId: expenseId });
  };

  const rejectExpense = (expenseId: string, rejectedBy: string) => {
    setExpenses((prev: Expense[]) =>
      prev.map((expense: Expense) =>
        expense.expense_id === expenseId ? { ...expense, approval_status: 'REJECTED', approved_by: rejectedBy } : expense,
      ),
    );

    pushAudit({ userId: rejectedBy, action: 'REJECT_EXPENSE', module: 'EXPENSES', targetId: expenseId });
  };

  const generatePO = (po: any) => {
    const now = new Date().toISOString();
    const poId = po.po_id ?? `PO-${Date.now()}`;

    const newPO: PurchaseOrder = {
      po_id: poId,
      supplier_name: po.supplier_name,
      items: po.items ?? [],
      total_amount: po.total_amount ?? 0,
      status: po.status ?? 'AWAITING_DELIVERY',
      created_by: po.created_by ?? 'SYSTEM',
      created_at: po.created_at ?? now,
      received_at: po.received_at,
      paid_at: po.paid_at,
    };

    setPurchaseOrders((prev: PurchaseOrder[]) => [newPO, ...prev]);
    pushAudit({ userId: newPO.created_by, action: 'GENERATE_PO', module: 'PROCUREMENT', targetId: poId });
  };

  const receiveGoods = (poId: string, userId: string) => {
    const po = purchaseOrders.find((item) => item.po_id === poId);
    if (!po || po.status !== 'AWAITING_DELIVERY') return;

    setInventory((prev: Inventory[]) =>
      prev.map((inventoryItem: Inventory) => {
        const receivedItem = po.items.find((item) => item.inventory_id === inventoryItem.inventory_id);
        if (!receivedItem) return inventoryItem;

        return normalizeInventoryItem(inventoryItem, inventoryItem.stock + Number(receivedItem.quantity || 0));
      }),
    );

    addJournalEntries([
      {
        journal_id: `JRN-REC-${poId}-${Date.now()}`,
        transaction_ref: poId,
        debit_account: '1110 - Inventory',
        credit_account: '2010 - Accounts Payable',
        amount: po.total_amount,
        description: 'Goods receipt and supplier invoice recognition',
        created_by: userId,
        entry_date: new Date().toISOString(),
        entry_type: 'PROCUREMENT',
      },
    ]);

    setPurchaseOrders((prev: PurchaseOrder[]) =>
      prev.map((item) => (item.po_id === poId ? { ...item, status: 'RECEIVED', received_at: new Date().toISOString() } : item)),
    );

    pushAudit({ userId, action: 'RECEIVE_GOODS', module: 'PROCUREMENT', targetId: poId });
  };

  const payBill = (poId: string, userId: string) => {
    const po = purchaseOrders.find((item) => item.po_id === poId);
    if (!po || po.status !== 'RECEIVED') return;

    addJournalEntries([
      {
        journal_id: `JRN-PAY-${poId}-${Date.now()}`,
        transaction_ref: poId,
        debit_account: '2010 - Accounts Payable',
        credit_account: '1010 - Cash',
        amount: po.total_amount,
        description: 'Payment to supplier',
        created_by: userId,
        entry_date: new Date().toISOString(),
        entry_type: 'PROCUREMENT',
      },
    ]);

    setPurchaseOrders((prev: PurchaseOrder[]) =>
      prev.map((item) => (item.po_id === poId ? { ...item, status: 'PAID', paid_at: new Date().toISOString() } : item)),
    );

    pushAudit({ userId, action: 'PAY_BILL', module: 'PROCUREMENT', targetId: poId });
  };

  const getDemandForecasts = () => {
    return inventory.map((item) => ({
      inventory_id: item.inventory_id,
      item_name: item.item_name,
      current_stock: item.stock,
      avg_daily_usage: Math.max(1, item.reorder_point / 7),
      estimated_days_remaining: Math.floor(item.stock / Math.max(1, item.reorder_point / 7)),
      reorder_recommendation: item.stock <= item.reorder_point,
    }));
  };

  const voidTransaction = (transactionId: string, reason: string, userId: string) => {
    const txn = transactions.find((item) => item.transaction_id === transactionId);
    if (!txn || txn.payment_status === 'VOIDED') return;

    setTransactions((prev: Transaction[]) =>
      prev.map((item) =>
        item.transaction_id === transactionId
          ? {
              ...item,
              payment_status: 'VOIDED',
              void_reason: reason,
              voided_by: userId,
              voided_at: new Date().toISOString(),
            }
          : item,
      ),
    );

    restoreInventoryByTransaction(txn);

    const originalEntries = journalEntries.filter((journal) => journal.transaction_ref === transactionId);
    const reversalEntries: JournalEntry[] = originalEntries.map((journal, index) => ({
      ...journal,
      journal_id: `JRN-REV-${transactionId}-${index}-${Date.now()}`,
      debit_account: journal.credit_account,
      credit_account: journal.debit_account,
      entry_date: new Date().toISOString(),
      description: `Void reversal: ${reason}`,
      created_by: userId,
      entry_type: 'CASH_ADJUSTMENT',
    }));

    addJournalEntries(reversalEntries);
    pushAudit({ userId, action: 'VOID_TRANSACTION', module: 'POS', targetId: transactionId, details: reason });
  };

  const closeShift = (data: any) => {
    pushAudit({
      userId: data.cashier_id ?? data.userId ?? 'SYSTEM',
      action: 'CLOSE_SHIFT',
      module: 'POS',
      targetId: data.shift_id ?? null,
      details: `Shift closed. Difference: ${data.cash_difference ?? 0}`,
    });
  };

  const value = useMemo<AppContextState>(
    () => ({
      role,
      auditTrail,
      transactions,
      journalEntries,
      inventory,
      expenses,
      purchaseOrders,
      setRole,
      pushAudit,
      addTransaction,
      addJournalEntries,
      deductInventory,
      approveExpense,
      rejectExpense,
      generatePO,
      receiveGoods,
      payBill,
      getDemandForecasts,
      voidTransaction,
      closeShift,
      addInventory,
      updateInventory,
      addExpense,
      updateExpense,
    }),
    [role, auditTrail, transactions, journalEntries, inventory, expenses, purchaseOrders],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext harus digunakan di dalam AppProvider');
  return ctx;
};
