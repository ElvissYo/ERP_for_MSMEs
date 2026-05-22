import { useState, useMemo, type FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import type { User, Inventory } from './index';
import FinanceWorkspace from './FinanceWorkspace';
import { services } from './services';

/* ─── IC Badge ─── */
function ICBadge({ id, text }: { id: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title={text}>
      [{id}]
    </span>
  );
}

/* ─── KPI Card ─── */
function KPICard({ label, value, sub, accent, icon }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-0.5">{label}</p>
        <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type InvoiceSnapshot = {
  po_id: string;
  status: string;
  total_amount: number;
  saved_at: string;
  data_url: string;
};

const INVOICE_SNAPSHOT_KEY = 'woyla_erp_invoice_snapshots';

const OPERATING_EXPENSE_ACCOUNTS = [
  '5010 - Operating Expense - General',
  '5100 - Salaries & Wages',
  '5200 - Rent Expense',
  '5300 - Utilities Expense',
  '5400 - Maintenance & Repairs',
  '5600 - Office Supplies Expense',
  '5900 - Miscellaneous Expense',
];

const PAYMENT_ACCOUNTS = ['1010 - Cash', '1020 - Cash in Bank'];

const getCategoryLabel = (serviceId: string) => {
  const service = services.find(svc => svc.service_id === serviceId);
  if (!service) return 'Other';
  if (service.category === 'Photo Service') return 'Photo';
  if (service.category === 'Other Services') return 'Other';
  return service.category;
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

const getServiceMaterialCost = (serviceId: string, qty: number, inventory: Inventory[]) => {
  const service = services.find(svc => svc.service_id === serviceId);
  if (!service?.cogs_mapping?.length) return 0;

  return service.cogs_mapping.reduce((sum, mapping) => {
    const item = inventory.find(inv => inv.inventory_id === mapping.inventory_id);
    if (!item) return sum;
    return sum + (Number(mapping.quantity_per_unit || 0) * qty * (item.unit_cost / getPackageUnitCount(item.item_name)));
  }, 0);
};

const getTransactionLines = (txn: any) => {
  const rawItems = txn.cart_items ?? txn.items;
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    return rawItems
      .map((item: any) => {
        const inventoryId = item.inventory_id ?? item.product_id ?? item.inventory?.inventory_id;
        const serviceId = item.service_id ?? item.service?.service_id;
        return {
          item_type: item.item_type ?? (inventoryId ? 'PRODUCT' : 'SERVICE'),
          service_id: serviceId,
          inventory_id: inventoryId,
          product_id: item.product_id ?? inventoryId,
          item_name: item.item_name ?? item.inventory?.item_name,
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.unit_price ?? item.service?.unit_price ?? 0),
          unit_cost: Number(item.unit_cost ?? item.inventory?.unit_cost ?? 0),
        };
      })
      .filter((line: any) => line.quantity > 0 && (line.service_id || line.inventory_id || line.product_id));
  }

  return [{ item_type: 'SERVICE', service_id: txn.service_id, quantity: Number(txn.quantity || 1), unit_price: 0 }];
};

const xmlEscape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const createInvoiceSnapshot = (po: any): InvoiceSnapshot => {
  const rows = po.items
    .slice(0, 4)
    .map((item: any, idx: number) => `
      <text x="54" y="${230 + idx * 34}" font-size="16" fill="#334155">${xmlEscape(item.item_name)}</text>
      <text x="525" y="${230 + idx * 34}" text-anchor="end" font-size="16" fill="#334155">${item.quantity}</text>
      <text x="746" y="${230 + idx * 34}" text-anchor="end" font-size="16" fill="#0f172a">Rp ${item.subtotal.toLocaleString('id-ID')}</text>
    `)
    .join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
      <rect width="800" height="520" rx="28" fill="#f8fafc"/>
      <rect x="32" y="32" width="736" height="456" rx="20" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="54" y="82" font-size="28" font-weight="800" fill="#0f172a">Commercial Invoice</text>
      <text x="54" y="112" font-size="15" fill="#64748b">Woyla Photocopy</text>
      <text x="746" y="82" text-anchor="end" font-size="17" font-weight="700" fill="#6d28d9">${xmlEscape(po.po_id)}</text>
      <text x="746" y="112" text-anchor="end" font-size="14" fill="#64748b">${xmlEscape(po.status)}</text>
      <line x1="54" y1="150" x2="746" y2="150" stroke="#e2e8f0" stroke-width="2"/>
      <text x="54" y="184" font-size="14" font-weight="700" fill="#64748b">Supplier</text>
      <text x="54" y="207" font-size="17" font-weight="800" fill="#0f172a">${xmlEscape(po.supplier_name)}</text>
      <text x="525" y="184" text-anchor="end" font-size="14" font-weight="700" fill="#64748b">Qty</text>
      <text x="746" y="184" text-anchor="end" font-size="14" font-weight="700" fill="#64748b">Amount</text>
      ${rows}
      <line x1="54" y1="390" x2="746" y2="390" stroke="#e2e8f0" stroke-width="2"/>
      <text x="54" y="430" font-size="13" fill="#64748b">Saved invoice image snapshot</text>
      <text x="746" y="430" text-anchor="end" font-size="18" font-weight="800" fill="#6d28d9">Rp ${po.total_amount.toLocaleString('id-ID')}</text>
      <text x="746" y="458" text-anchor="end" font-size="12" fill="#94a3b8">${new Date().toLocaleString('id-ID')}</text>
    </svg>
  `;

  return {
    po_id: po.po_id,
    status: po.status,
    total_amount: po.total_amount,
    saved_at: new Date().toISOString(),
    data_url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
};

const loadInvoiceSnapshots = (): Record<string, InvoiceSnapshot> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(INVOICE_SNAPSHOT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

/* ─── PO Modal ─── */
function POModal({ item, createdBy, onClose, onGenerate }: { item: Inventory; createdBy: string; onClose: () => void; onGenerate: (po: any) => void }) {
  const [qty, setQty] = useState(Math.max(item.reorder_point * 3 - item.stock, 10));
  const [supplier, setSupplier] = useState(item.supplier_name);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Stock Request / Purchase Order</h3>
          <ICBadge id="IC-4" text="Threshold Authorization" />
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-sm">
          <p className="font-semibold text-slate-700">{item.item_name}</p>
          <p className="text-xs text-slate-500">Current stock: {item.stock} · Reorder: {item.reorder_point}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Order Quantity</label>
          <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none" min={1} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Supplier</label>
          <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none" />
        </div>
        <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">
          <span>Estimated Total</span>
          <span>Rp {(qty * item.unit_cost).toLocaleString('id-ID')}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl">Cancel</button>
          <button onClick={() => { onGenerate({ supplier_name: supplier, items: [{ inventory_id: item.inventory_id, item_name: item.item_name, quantity: qty, unit_cost: item.unit_cost, subtotal: qty * item.unit_cost }], total_amount: qty * item.unit_cost, created_by: createdBy }); onClose(); }}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl">Create PO</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Supplier Invoice Modal ─── */
function GeneralJournalPanel({
  latestEntries,
  onPost,
}: {
  latestEntries: any[];
  onPost: (entry: { description: string; debitAccount: string; creditAccount: string; amount: number }) => void;
}) {
  const [description, setDescription] = useState('Electricity bill');
  const [debitAccount, setDebitAccount] = useState('5300 - Utilities Expense');
  const [creditAccount, setCreditAccount] = useState('1010 - Cash');
  const [amount, setAmount] = useState('250000');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!description.trim() || parsedAmount <= 0) return;

    onPost({
      description: description.trim(),
      debitAccount,
      creditAccount,
      amount: parsedAmount,
    });
    setDescription('');
    setAmount('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">General Journal Entry</h3>
        <ICBadge id="IC-2" text="Double Entry Control" />
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Debit Account</label>
          <select value={debitAccount} onChange={e => setDebitAccount(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none">
            {OPERATING_EXPENSE_ACCOUNTS.map(account => <option key={account} value={account}>{account}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Paid From</label>
            <select value={creditAccount} onChange={e => setCreditAccount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none">
              {PAYMENT_ACCOUNTS.map(account => <option key={account} value={account}>{account}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
            <input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none" />
          </div>
        </div>
        <button type="submit"
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
          Post Journal Entry
        </button>
      </form>
      <div className="border-t border-slate-100 divide-y divide-slate-100 max-h-36 overflow-y-auto">
        {latestEntries.length === 0 && <div className="px-5 py-5 text-center text-xs text-slate-400">No operating cost journal yet</div>}
        {latestEntries.map(entry => (
          <div key={entry.journal_id} className="px-5 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{entry.description}</p>
                <p className="text-[10px] text-slate-400">{entry.debit_account} / {entry.credit_account}</p>
              </div>
              <p className="text-xs font-bold text-slate-900 shrink-0">Rp {entry.amount.toLocaleString('id-ID')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvoiceModal({ po, snapshot, onClose }: { po: any; snapshot?: InvoiceSnapshot; onClose: () => void }) {
  const history = [
    { label: 'PO Created', time: po.created_at, status: 'CREATED' },
    { label: 'Goods Received', time: po.received_at, status: 'RECEIVED' },
    { label: 'Bill Paid', time: po.paid_at, status: 'PAID' },
  ].filter(item => item.time);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Commercial Invoice</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{po.po_id}</p>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${po.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {po.status === 'PAID' ? 'PAID / LUNAS' : 'PAYMENT DUE'}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Billed To</p>
              <p className="font-bold text-slate-700">Woyla Photocopy</p>
              <p className="text-slate-500">Jl. Education No. 1, Cikarang</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Supplier</p>
              <p className="font-bold text-slate-700">{po.supplier_name}</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b-2 border-slate-800 text-slate-700">
              <th className="text-left py-2 font-semibold">Item Description</th>
              <th className="text-center py-2 font-semibold">Qty</th>
              <th className="text-right py-2 font-semibold">Unit Price</th>
              <th className="text-right py-2 font-semibold">Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {po.items.map((item: any, idx: number) => (<tr key={idx}><td className="py-3 text-slate-800">{item.item_name}</td><td className="py-3 text-center text-slate-600">{item.quantity}</td><td className="py-3 text-right text-slate-600">Rp {item.unit_cost.toLocaleString('id-ID')}</td><td className="py-3 text-right font-semibold text-slate-800">Rp {item.subtotal.toLocaleString('id-ID')}</td></tr>))}
            </tbody>
            <tfoot><tr><td colSpan={3} className="py-4 text-right text-xs font-bold text-slate-500 uppercase">Grand Total</td><td className="py-4 text-right text-lg font-bold text-violet-700">Rp {po.total_amount.toLocaleString('id-ID')}</td></tr></tfoot>
          </table>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Invoice History</p>
              <div className="space-y-2.5">
                {history.map((item, idx) => (
                  <div key={item.status} className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${idx === history.length - 1 ? 'bg-violet-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{idx + 1}</div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{new Date(item.time).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Saved Image</p>
                {snapshot && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">SAVED</span>}
              </div>
              {snapshot ? (
                <>
                  <img src={snapshot.data_url} alt={`Invoice snapshot ${po.po_id}`} className="w-full rounded-lg border border-slate-200 bg-white" />
                  <p className="text-[10px] text-slate-400 mt-2">Saved at {new Date(snapshot.saved_at).toLocaleString('id-ID')}</p>
                </>
              ) : (
                <p className="text-xs text-slate-400">Snapshot will be created when invoice is opened.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Owner Dashboard ─── */
export default function OwnerDashboard({ user, activeTab }: { user: User; activeTab: string }) {
  const {
    transactions = [], journalEntries = [], inventory = [], purchaseOrders = [],
    addJournalEntries, pushAudit, generatePO, receiveGoods, payBill, getDemandForecasts,
  } = useAppContext() || {};

  const [poModalItem, setPoModalItem] = useState<Inventory | null>(null);
  const [invoiceModalItem, setInvoiceModalItem] = useState<any | null>(null);
  const [invoiceSnapshots, setInvoiceSnapshots] = useState<Record<string, InvoiceSnapshot>>(() => loadInvoiceSnapshots());
  const [poSort, setPoSort] = useState<'newest' | 'oldest' | 'amount'>('newest');
  const [txnSort, setTxnSort] = useState<'newest' | 'oldest' | 'amount'>('newest');

  const openInvoice = (po: any) => {
    const current = invoiceSnapshots[po.po_id];
    const needsSnapshot = !current || current.status !== po.status || current.total_amount !== po.total_amount;
    if (!needsSnapshot) {
      setInvoiceModalItem(po);
      return;
    }

    const nextSnapshot = createInvoiceSnapshot(po);
    const nextSnapshots = { ...invoiceSnapshots, [po.po_id]: nextSnapshot };
    setInvoiceSnapshots(nextSnapshots);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INVOICE_SNAPSHOT_KEY, JSON.stringify(nextSnapshots));
    }
    setInvoiceModalItem(po);
  };

  /* ─── Financial Computations ─── */
  const paidTxns = transactions.filter(t => t.payment_status === 'PAID');
  const grossRevenue = paidTxns.reduce((s, t) => s + t.subtotal, 0);
  const totalTax = paidTxns.reduce((s, t) => s + t.tax_amount, 0);
  const totalCogs = journalEntries.filter(j => j.entry_type === 'COGS').reduce((s, j) => s + j.amount, 0);
  const netRevenue = grossRevenue - totalCogs;
  const operatingExpenseEntries = journalEntries.filter(j => j.entry_type === 'EXPENSE' && /^[56]/.test(j.debit_account));
  const totalOperatingExpenses = operatingExpenseEntries.reduce((s, j) => s + j.amount, 0);
  const lowStock = inventory.filter(i => i.stock < i.reorder_point);
  const forecasts = getDemandForecasts ? getDemandForecasts() : [];

  const marginByCategory = useMemo(() => {
    const map: Record<string, { revenue: number; cogs: number }> = {};

    paidTxns.forEach(txn => {
      const lines = getTransactionLines(txn);
      const subtotal = txn.subtotal || 0;
      const lineBase = lines.reduce((sum: number, line: any) => {
        const service = services.find(svc => svc.service_id === line.service_id);
        return sum + (line.unit_price || service?.unit_price || 0) * line.quantity;
      }, 0);

      lines.forEach((line: any) => {
        const isProductLine = line.item_type === 'PRODUCT';
        const category = isProductLine ? 'Product' : getCategoryLabel(line.service_id);
        const service = services.find(svc => svc.service_id === line.service_id);
        const lineUnitPrice = line.unit_price || service?.unit_price || 0;
        const lineRevenue = lineBase > 0 ? subtotal * ((lineUnitPrice * line.quantity) / lineBase) : subtotal;
        const productCost = isProductLine
          ? (line.unit_cost || inventory.find(item => item.inventory_id === line.inventory_id || item.inventory_id === line.product_id)?.unit_cost || 0) * line.quantity
          : 0;

        if (!map[category]) map[category] = { revenue: 0, cogs: 0 };
        map[category].revenue += lineRevenue;
        map[category].cogs += isProductLine ? productCost : getServiceMaterialCost(line.service_id, line.quantity, inventory);
      });
    });

    return Object.entries(map)
      .map(([category, values]) => ({
        category,
        revenue: values.revenue,
        cogs: values.cogs,
        margin: values.revenue - values.cogs,
        marginPct: values.revenue > 0 ? Math.round(((values.revenue - values.cogs) / values.revenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [paidTxns, inventory]);

  const sortedPurchaseOrders = useMemo(() => {
    return purchaseOrders.slice().sort((a, b) => {
      if (poSort === 'amount') return b.total_amount - a.total_amount;
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return poSort === 'oldest' ? diff : -diff;
    });
  }, [purchaseOrders, poSort]);

  const sortedTransactions = useMemo(() => {
    return transactions.slice().sort((a, b) => {
      if (txnSort === 'amount') return b.total_amount - a.total_amount;
      const diff = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
      return txnSort === 'oldest' ? diff : -diff;
    });
  }, [transactions, txnSort]);

  const latestOperatingExpenseEntries = useMemo(() => {
    return operatingExpenseEntries
      .slice()
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
      .slice(0, 4);
  }, [operatingExpenseEntries]);

  const handlePostGeneralJournal = (entry: { description: string; debitAccount: string; creditAccount: string; amount: number }) => {
    const now = new Date().toISOString();
    const ref = `GJ-${Date.now()}`;

    addJournalEntries?.([{
      journal_id: `JRN-GJ-${Date.now()}`,
      transaction_ref: ref,
      debit_account: entry.debitAccount,
      credit_account: entry.creditAccount,
      amount: entry.amount,
      description: entry.description,
      created_by: user.user_id,
      entry_date: now,
      entry_type: 'EXPENSE',
    }]);

    pushAudit?.({
      userId: user.user_id,
      action: 'CREATE_GENERAL_JOURNAL',
      module: 'ACCOUNTING',
      targetId: ref,
      details: `General journal posted for Rp ${entry.amount.toLocaleString('id-ID')}`,
    });
  };

  /* ─── Procurement Tab ─── */
  if (activeTab === 'procurement') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Procurement Cycle</h2>
          <ICBadge id="IC-4" text="Threshold Authorization" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
          {['Request', 'Purchase Order', 'Receive Goods', 'Invoice & Payment'].map((step, idx) => (
            <div key={step} className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
              <span className="text-xs font-bold text-slate-700">{step}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* PO List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Purchase Order List</h3>
              <div className="flex items-center gap-2">
                <select value={poSort} onChange={e => setPoSort(e.target.value as typeof poSort)}
                  className="text-[10px] font-bold rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 outline-none">
                  <option value="newest">Newest date</option>
                  <option value="oldest">Oldest date</option>
                  <option value="amount">Highest amount</option>
                </select>
                <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-bold">{purchaseOrders.length} PO</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {purchaseOrders.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">No POs yet</div>}
              {sortedPurchaseOrders.map(po => (
                <div key={po.po_id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-violet-700">{po.po_id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${po.status === 'AWAITING_DELIVERY' ? 'bg-amber-50 text-amber-700 border-amber-200' : po.status === 'RECEIVED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{po.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{po.supplier_name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(po.created_at).toLocaleDateString('id-ID')} · {po.items.length} item · Rp {po.total_amount.toLocaleString('id-ID')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-slate-500">
                    {po.received_at && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Received {new Date(po.received_at).toLocaleDateString('id-ID')}</span>}
                    {po.paid_at && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Paid {new Date(po.paid_at).toLocaleDateString('id-ID')}</span>}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {po.status === 'AWAITING_DELIVERY' && (
                      <button onClick={() => receiveGoods(po.po_id, user.user_id)}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Receive Goods</button>
                    )}
                    {po.status === 'RECEIVED' && (
                      <>
                        <button onClick={() => payBill(po.po_id, user.user_id)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Pay Bill</button>
                        <button onClick={() => openInvoice(po)}
                          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">View Invoice</button>
                      </>
                    )}
                    {po.status === 'PAID' && (
                      <button onClick={() => openInvoice(po)}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors">View Invoice</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock + Generate PO */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Low Stock & Forecast</h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">{lowStock.length} ITEM</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {inventory.map(item => {
                const fc = forecasts.find(f => f.inventory_id === item.inventory_id);
                const isLow = item.stock < item.reorder_point;
                return (
                  <div key={item.inventory_id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-700">{item.item_name}</p>
                      {isLow && <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-bold">LOW</span>}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>Stock: <b className={isLow ? 'text-red-600' : 'text-slate-700'}>{item.stock}</b> / min {item.reorder_point}</span>
                      {fc && fc.estimated_days_remaining !== 999 && (
                        <span className={fc.reorder_recommendation ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                          Depleted ~{fc.estimated_days_remaining} days
                        </span>
                      )}
                    </div>
                    <button onClick={() => setPoModalItem(item)}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors">
                      Create PO
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {poModalItem && <POModal item={poModalItem} createdBy={user.user_id} onClose={() => setPoModalItem(null)} onGenerate={po => generatePO(po)} />}
        {invoiceModalItem && <InvoiceModal po={invoiceModalItem} snapshot={invoiceSnapshots[invoiceModalItem.po_id]} onClose={() => setInvoiceModalItem(null)} />}
      </div>
    );
  }

  /* ─── Financial Statements Tab ─── */
  if (activeTab === 'financials') {
    return (
      <div className="space-y-4">
        <FinanceWorkspace journalEntries={journalEntries} entityName="Woyla Photocopy" />
      </div>
    );
  }

  /* ─── Dashboard Tab ─── */
  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KPICard label="Gross Revenue" value={`Rp ${grossRevenue.toLocaleString('id-ID')}`}
          sub={`${paidTxns.length} transactions`} accent="bg-emerald-100"
          icon={<svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <KPICard label="Net Revenue (Net - COGS)" value={`Rp ${netRevenue.toLocaleString('id-ID')}`}
          sub={`COGS: Rp ${totalCogs.toLocaleString('id-ID')}`} accent="bg-violet-100"
          icon={<svg className="w-5 h-5 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <KPICard label="VAT Payable Tracking" value={`Rp ${totalTax.toLocaleString('id-ID')}`}
          sub="11% of revenue" accent="bg-sky-100"
          icon={<svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>} />
        <KPICard label="Operating Expenses" value={`Rp ${totalOperatingExpenses.toLocaleString('id-ID')}`}
          sub={`${operatingExpenseEntries.length} journal entries`} accent="bg-amber-100"
          icon={<svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue by Category */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">Operational Utilization by Category</h3>
            <span className="text-[10px] text-slate-400">Gross profit margin per service</span>
          </div>
          <div className="space-y-3">
            {marginByCategory.map(row => {
              const pct = Math.max(0, Math.min(row.marginPct, 100));
              const isHealthy = row.marginPct >= 30;
              return (
                <div key={row.category} className="flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <p className="text-xs font-bold text-slate-700">{row.category}</p>
                    <p className="text-[10px] text-slate-400">Rp {Math.round(row.revenue).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <p className={`text-xs font-bold ${row.marginPct < 0 ? 'text-red-600' : 'text-slate-800'}`}>{row.marginPct}%</p>
                    <p className="text-[10px] text-slate-400">margin</p>
                  </div>
                </div>
              );
            })}
            {marginByCategory.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No category data yet</p>}
          </div>
        </div>

        <GeneralJournalPanel latestEntries={latestOperatingExpenseEntries} onPost={handlePostGeneralJournal} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Inventory with forecast */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Inventory & Stock Forecast</h3>
            <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-bold">30-day run rate</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {inventory.slice(0, 10).map(item => {
              const fc = forecasts.find(f => f.inventory_id === item.inventory_id);
              const isLow = item.stock < item.reorder_point;
              return (
                <div key={item.inventory_id} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-700 truncate">{item.item_name}</p>
                      {isLow && <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-bold shrink-0">LOW</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((item.stock / (item.reorder_point * 3)) * 100, 100)}%` }} />
                      </div>
                      {fc && fc.estimated_days_remaining !== 999 && (
                        <span className={`text-[10px] shrink-0 ${fc.reorder_recommendation ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                          ~{fc.estimated_days_remaining} days
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-slate-800'}`}>{item.stock}</p>
                    <p className="text-[10px] text-slate-400">min {item.reorder_point}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Transaction History</h3>
            <div className="flex items-center gap-2">
              <select value={txnSort} onChange={e => setTxnSort(e.target.value as typeof txnSort)}
                className="text-[10px] font-bold rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 outline-none">
                <option value="newest">Newest date</option>
                <option value="oldest">Oldest date</option>
                <option value="amount">Highest amount</option>
              </select>
              <span className="text-xs text-slate-400">{transactions.length} total</span>
            </div>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Method</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                  <th className="text-center px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTransactions.slice(0, 10).map(t => (
                  <tr key={t.transaction_id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-mono text-slate-500">{t.transaction_id}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(t.transaction_date).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-5 py-3 text-slate-600">{t.payment_method}</td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">Rp {t.total_amount.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${t.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : t.payment_status === 'VOIDED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {t.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
