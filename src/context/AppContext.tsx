import React, { createContext, useContext, useMemo, useState } from 'react';
import { type Inventory, type Expense, type JournalEntry, type Transaction, type AuditTrail, type UserRole } from '../data/index';
import { transactions as seedTransactions } from '../data/transactions';
import { journalEntries as seedJournalEntries } from '../data/journalEntries';
import { inventory as seedInventory } from '../data/inventory';
import { expenses as seedExpenses } from '../data/expenses';
import { auditTrail as seedAuditTrail } from '../data/auditTrail';

export type ActionName =
  | 'LOGIN'
  | 'CREATE_TRANSACTION'
  | 'UPDATE_INVENTORY'
  | 'CREATE_EXPENSE'
  | 'APPROVE_EXPENSE'
  | 'REJECT_EXPENSE'
  | 'VIEW_REPORT'
  | 'VIEW_LEDGER'
  | 'EXPORT_DATA';

export type AppContextState = {
  role: UserRole;
  auditTrail: AuditTrail[];
  transactions: Transaction[];
  journalEntries: JournalEntry[];
  inventory: Inventory[];
  expenses: Expense[];
  purchaseOrders: any[];

  // actions (event-driven)
  setRole: (role: UserRole) => void;
  pushAudit: (args: { userId: string; action: ActionName; module: string; targetId?: string | null }) => void;

  addTransaction: (txn: Transaction) => void;
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

export const AppProvider = ({
  children,
  initialRole = 'CASHIER',
}: {
  children: React.ReactNode;
  initialRole?: UserRole;
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);

  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>(seedAuditTrail);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(seedJournalEntries);
  const [inventory, setInventory] = useState<Inventory[]>(seedInventory);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  const pushAudit = ({ userId, action, module, targetId = null }: { userId: string; action: ActionName; module: string; targetId?: string | null }) => {
    const entry: AuditTrail = {
      audit_id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      // AuditTrail.action is based on data/index.ts AuditAction.
      // Because ActionName is broader than AuditAction, cast for now to unblock compilation.
      action: action as any,
      module,
      target_id: targetId,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1',
    };
    setAuditTrail((prev: AuditTrail[]) => [entry, ...prev]);
  };

  const addTransaction = (txn: Transaction) => {
    setTransactions((prev: Transaction[]) => [...prev, txn]);
  };

  const addJournalEntries = (entries: JournalEntry[]) => {
    setJournalEntries((prev: JournalEntry[]) => [...prev, ...entries]);
  };

  const deductInventory = (inventoryId: string, qty: number) => {
    setInventory((prev: Inventory[]) =>
      prev.map((item: Inventory) =>
        item.inventory_id === inventoryId ? { ...item, stock: Math.max(0, item.stock - qty) } : item,
      ),
    );
  };

  const addInventory = (item: Inventory) => setInventory((prev: Inventory[]) => [item, ...prev]);
  const updateInventory = (item: Inventory) => setInventory((prev: Inventory[]) => prev.map(i => i.inventory_id === item.inventory_id ? item : i));
  const addExpense = (expense: Expense) => setExpenses((prev: Expense[]) => [expense, ...prev]);
  const updateExpense = (expense: Expense) => setExpenses((prev: Expense[]) => prev.map(e => e.expense_id === expense.expense_id ? expense : e));

  const approveExpense = (expenseId: string, approvedBy: string) => {
    setExpenses((prev: Expense[]) =>
      prev.map((e: Expense) => (e.expense_id === expenseId ? { ...e, approval_status: 'APPROVED', approved_by: approvedBy } : e)),
    );
  };

  const rejectExpense = (expenseId: string, rejectedBy: string) => {
    setExpenses((prev: Expense[]) =>
      prev.map((e: Expense) => (e.expense_id === expenseId ? { ...e, approval_status: 'REJECTED', approved_by: rejectedBy } : e)),
    );
  };

  const generatePO = (po: any) => {
    setPurchaseOrders((prev: any[]) => [{ po_id: `PO-${Date.now()}`, status: 'AWAITING_DELIVERY', ...po }, ...prev]);
  };

  const receiveGoods = (poId: string, userId: string) => {
    setPurchaseOrders((prev: any[]) => prev.map(p => p.po_id === poId ? { ...p, status: 'RECEIVED' } : p));
  };

  const payBill = (poId: string, userId: string) => {
    setPurchaseOrders((prev: any[]) => prev.map(p => p.po_id === poId ? { ...p, status: 'PAID' } : p));
  };

  const getDemandForecasts = () => {
    return inventory.map(item => ({
      inventory_id: item.inventory_id,
      estimated_days_remaining: Math.floor(item.stock / Math.max(1, (item.reorder_point / 7))),
      reorder_recommendation: item.stock <= item.reorder_point
    }));
  };

  const voidTransaction = (transactionId: string, reason: string, userId: string) => {
    setTransactions((prev: Transaction[]) => prev.map(t => t.transaction_id === transactionId ? { ...t, payment_status: 'VOIDED' } : t));
  };

  const closeShift = (data: any) => {
    console.log('Shift closed:', data);
  };

  const value = useMemo<AppContextState>(
    () => ({
      role, auditTrail, transactions, journalEntries, inventory, expenses, purchaseOrders,
      setRole, pushAudit, addTransaction, addJournalEntries, deductInventory, approveExpense,
      rejectExpense, generatePO, receiveGoods, payBill, getDemandForecasts, voidTransaction, closeShift, addInventory, updateInventory, addExpense, updateExpense,
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
