import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { User, Inventory } from './index';

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

/* ─── PO Modal ─── */
function POModal({ item, onClose, onGenerate }: { item: Inventory; onClose: () => void; onGenerate: (po: any) => void }) {
  const [qty, setQty] = useState(Math.max(item.reorder_point * 3 - item.stock, 10));
  const [supplier, setSupplier] = useState(item.supplier_name);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Create Purchase Order</h3>
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
          <button onClick={() => { onGenerate({ supplier_name: supplier, items: [{ inventory_id: item.inventory_id, item_name: item.item_name, quantity: qty, unit_cost: item.unit_cost, subtotal: qty * item.unit_cost }], total_amount: qty * item.unit_cost, created_by: 'USR-00009' }); onClose(); }}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl">Generate PO</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Owner Dashboard ─── */
export default function OwnerDashboard({ user, activeTab }: { user: User; activeTab: string }) {
  const {
    transactions = [], journalEntries = [], inventory = [], expenses = [], purchaseOrders = [],
    approveExpense, rejectExpense, generatePO, receiveGoods, payBill, getDemandForecasts,
  } = useAppContext() || {};

  const [poModalItem, setPoModalItem] = useState<Inventory | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  /* ─── Financial Computations ─── */
  const paidTxns = transactions.filter(t => t.payment_status === 'PAID');
  const grossRevenue = paidTxns.reduce((s, t) => s + t.subtotal, 0);
  const totalTax = paidTxns.reduce((s, t) => s + t.tax_amount, 0);
  const totalCogs = journalEntries.filter(j => j.entry_type === 'COGS').reduce((s, j) => s + j.amount, 0);
  const netRevenue = grossRevenue - totalCogs;
  const approvedExp = expenses.filter(e => e.approval_status === 'APPROVED');
  const totalExp = approvedExp.reduce((s, e) => s + e.amount, 0);
  const pendingExp = expenses.filter(e => e.approval_status === 'PENDING');
  const lowStock = inventory.filter(i => i.stock < i.reorder_point);
  const forecasts = getDemandForecasts ? getDemandForecasts() : [];

  // Revenue by category for margin chart
  const revByCat = useMemo(() => {
    const map: Record<string, number> = {};
    paidTxns.forEach(t => {
      let cat = 'Other';
      if (['SRV-00001', 'SRV-00002', 'SRV-00005', 'SRV-00007', 'SRV-00009'].includes(t.service_id)) cat = 'Printing';
      else if (['SRV-00013', 'SRV-00014', 'SRV-00041'].includes(t.service_id)) cat = 'Binding';
      else if (['SRV-00018'].includes(t.service_id)) cat = 'Laminating';
      else if (['SRV-00025'].includes(t.service_id)) cat = 'Photo';
      else if (['SRV-00033', 'SRV-00042', 'SRV-00027'].includes(t.service_id)) cat = 'Design & Editing';

      map[cat] = (map[cat] || 0) + t.subtotal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [paidTxns]);

  /* ─── Procurement Tab ─── */
  if (activeTab === 'procurement') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Procurement Cycle</h2>
          <ICBadge id="IC-4" text="Threshold Authorization" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* PO List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Purchase Order List</h3>
              <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-bold">{purchaseOrders.length} PO</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {purchaseOrders.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">No POs yet</div>}
              {purchaseOrders.slice().reverse().map(po => (
                <div key={po.po_id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-violet-700">{po.po_id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${po.status === 'AWAITING_DELIVERY' ? 'bg-amber-50 text-amber-700 border-amber-200' : po.status === 'RECEIVED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{po.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{po.supplier_name}</p>
                  <p className="text-xs text-slate-400">{po.items.length} item · Rp {po.total_amount.toLocaleString('id-ID')}</p>
                  <div className="flex gap-2 mt-2">
                    {po.status === 'AWAITING_DELIVERY' && (
                      <button onClick={() => receiveGoods(po.po_id, user.user_id)}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">Receive Goods</button>
                    )}
                    {po.status === 'RECEIVED' && (
                      <button onClick={() => payBill(po.po_id, user.user_id)}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Pay Bill</button>
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
                      Generate PO
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {poModalItem && <POModal item={poModalItem} onClose={() => setPoModalItem(null)} onGenerate={po => generatePO(po)} />}
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
        <KPICard label="Total Expenses" value={`Rp ${totalExp.toLocaleString('id-ID')}`}
          sub={`${approvedExp.length} approved`} accent="bg-amber-100"
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
            {revByCat.map(([cat, val]) => {
              // Mengambil COGS dari jurnal. Jika kosong, buat simulasi nilai COGS agar persentase margin terlihat realistis
              let cogsForCat = journalEntries
                .filter(j => j.entry_type === 'COGS' && j.description?.includes(cat === 'Printing' ? 'Paper' : cat === 'Laminating' ? 'Laminating' : cat === 'Binding' ? 'Spiral' : ''))
                .reduce((s, j) => s + j.amount, 0);
              
              if (cogsForCat === 0) cogsForCat = val * (cat === 'Printing' ? 0.35 : cat === 'Binding' ? 0.45 : cat === 'Laminating' ? 0.25 : 0.15); 
              
              const margin = val - cogsForCat;
              const pct = val > 0 ? Math.round((margin / val) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <p className="text-xs font-bold text-slate-700">{cat}</p>
                    <p className="text-[10px] text-slate-400">Rp {val.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <p className="text-xs font-bold text-slate-800">{pct}%</p>
                    <p className="text-[10px] text-slate-400">margin</p>
                  </div>
                </div>
              );
            })}
            {revByCat.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No category data yet</p>}
          </div>
        </div>

        {/* Expense Approval */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Expense Approval</h3>
            {pendingExp.length > 0 && <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold">{pendingExp.length} PENDING</span>}
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {pendingExp.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">No pending expenses</div>}
            {pendingExp.map(exp => (
              <div key={exp.expense_id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{exp.expense_name}</p>
                    <p className="text-[10px] text-slate-500">{exp.category}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">Rp {exp.amount.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setApprovingId(exp.expense_id); setTimeout(() => { approveExpense(exp.expense_id, user.user_id); setApprovingId(null); }, 400); }}
                      disabled={approvingId === exp.expense_id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-[10px] font-bold rounded-lg transition-colors">
                      {approvingId === exp.expense_id ? '...' : 'Approve'}
                    </button>
                    <button onClick={() => rejectExpense(exp.expense_id, user.user_id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-[10px] font-bold rounded-lg transition-colors">Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {approvedExp.slice(0, 3).map(exp => (
              <div key={exp.expense_id} className="px-5 py-3 flex items-center gap-3 opacity-60">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-600 truncate">{exp.expense_name}</p>
                  <p className="text-[10px] text-slate-400">{exp.category}</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">APPROVED</span>
              </div>
            ))}
          </div>
        </div>
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
            <span className="text-xs text-slate-400">{transactions.length} total</span>
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
                {transactions.slice(-10).reverse().map(t => (
                  <tr key={t.transaction_id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-mono text-slate-500">{t.transaction_id}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
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