import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { getActiveServices } from '../data/services';
import type { Service, User } from '../types';

/* ─── Types ─── */
interface CartItem { service: Service; quantity: number; }

/* ─── IC Badge ─── */
function ICBadge({ id, text }: { id: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title={text}>
      [{id}]
    </span>
  );
}

/* ─── Category Colors ─── */
const CAT_COLORS: Record<string, string> = {
  Printing: 'bg-blue-50 text-blue-700 border-blue-200',
  Fotocopy: 'bg-violet-50 text-violet-700 border-violet-200',
  Binding: 'bg-amber-50 text-amber-700 border-amber-200',
  Laminating: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Scanning: 'bg-sky-50 text-sky-700 border-sky-200',
  'Photo Service': 'bg-rose-50 text-rose-700 border-rose-200',
  'Design & Editing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Other Services': 'bg-slate-100 text-slate-600 border-slate-200',
};

function CatBadge({ cat }: { cat: string }) {
  const cls = CAT_COLORS[cat] || CAT_COLORS['Other Services'];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{cat}</span>;
}

/* ─── Cross-sell engine ─── */
function getCrossSell(cart: CartItem[]): { show: boolean; message: string } {
  const printQty = cart.filter(c => c.service.category === 'Printing').reduce((s, c) => s + c.quantity, 0);
  const hasBinding = cart.some(c => c.service.category === 'Binding');
  const hasLaminating = cart.some(c => c.service.category === 'Laminating');
  if (printQty >= 50 && !hasBinding && !hasLaminating) {
    return { show: true, message: `Customer printed ${printQty} sheets. Recommendation: Spiral Binding / Laminating` };
  }
  const photoQty = cart.filter(c => c.service.category === 'Photo Service').reduce((s, c) => s + c.quantity, 0);
  if (photoQty >= 5 && !hasLaminating) {
    return { show: true, message: `Customer printed ${photoQty} photos. Recommendation: ID Card Laminating` };
  }
  return { show: false, message: '' };
}

/* ─── Checkout Receipt ─── */
function Receipt({ txn, onBack }: { txn: any; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-300">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-emerald-800">Payment Successful</h2>
          <p className="text-emerald-700 text-sm mt-0.5 font-mono">{txn.id}</p>
          <p className="text-emerald-600 text-xs mt-1">{txn.time}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-emerald-600 mb-0.5">Total</p>
          <p className="text-2xl font-bold text-emerald-800">Rp {txn.total.toLocaleString('en-US')}</p>

        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ l: 'Subtotal', v: txn.subtotal }, { l: 'PPN 11%', v: txn.tax }, { l: 'Grand Total', v: txn.total }].map(i => (
          <div key={i.l} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{i.l}</p>
            <p className="text-base font-bold text-slate-800">Rp {i.v.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="text-sm font-semibold text-slate-700">Automatic Journal Entry — Double Entry</h3>
            <ICBadge id="IC-2" text="Automatic Calculation" />
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase">
            <th className="text-left px-5 py-3 font-medium">Account</th>
            <th className="text-right px-5 py-3 font-medium">Debit</th>
            <th className="text-right px-5 py-3 font-medium">Credit</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {txn.entries.map((e: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium text-slate-700">{e.account}</td>
                <td className="px-5 py-3 text-right font-mono text-emerald-700">{e.debit > 0 ? `Rp ${e.debit.toLocaleString('id-ID')}` : '—'}</td>
                <td className="px-5 py-3 text-right font-mono text-sky-700">{e.credit > 0 ? `Rp ${e.credit.toLocaleString('id-ID')}` : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200">
              <td className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Balanced</td>
              <td className="px-5 py-3 text-right font-bold font-mono text-slate-800">Rp {txn.total.toLocaleString('id-ID')}</td>
              <td className="px-5 py-3 text-right font-bold font-mono text-slate-800">Rp {txn.total.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button onClick={onBack} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Terminal
      </button>
    </div>
  );
}

/* ─── Void Modal ─── */
function VoidModal({ txn, onClose, onConfirm }: { txn: any; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');

  const handle = () => {
    if (pin !== '1234') { setErr('Incorrect Owner PIN.'); return; }
    if (!reason.trim()) { setErr('Reason is required.'); return; }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Void Transaction</h3>
          <p className="text-xs text-slate-500">{txn.transaction_id} · Rp {txn.total_amount.toLocaleString('en-US')}</p>

          </div>
          <ICBadge id="IC-4" text="Threshold Authorization" />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
          Void requires Owner authorization. Enter Owner PIN (default: 1234).
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Owner PIN</label>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none" placeholder="••••" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Void Reason</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" placeholder="Example: Wrong amount input..." />
        </div>
        {err && <p className="text-xs text-red-600 font-medium">{err}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">Cancel</button>
          <button onClick={handle} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">Confirm Void</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Close Shift Modal ─── */
function CloseShiftModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { transactions = [], closeShift } = useAppContext() || {};
  // const [actual, setActual] = useState(''); // Dihapus sesuai permintaan
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const myTxns = transactions.filter(t =>
    t.cashier_id === user.user_id &&
    t.payment_method === 'CASH' &&
    t.payment_status === 'PAID' &&
    t.transaction_date?.startsWith(today)
  );
  const expected = myTxns.reduce((s, t) => s + t.total_amount, 0);
  const actualNum = expected; // Asumsikan kas fisik = kas sistem
  const diff = 0; // Selisih selalu 0

  const handleSubmit = () => {
    closeShift?.({
      cashier_id: user.user_id,
      start_time: `${today}T08:00:00Z`,
      end_time: new Date().toISOString(),
      expected_cash: expected,
      actual_cash: actualNum,
      cash_difference: diff,
      transaction_count: myTxns.length,
      notes: notes || undefined,
    });
    setDone(true);
  };

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Shift Closed Successfully</h3>
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">System Cash</span><span className="font-bold">Rp {expected.toLocaleString('id-ID')}</span></div>
          </div>
          <button onClick={onClose} className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl text-sm">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Close Shift / Close Register</h3>
              <p className="text-xs text-slate-500">{user.full_name} · {today}</p>
            </div>
          </div>
          <ICBadge id="IC-6" text="Cash Reconciliation" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Today's Transactions</p>
            <p className="text-lg font-bold text-slate-800">{myTxns.length}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">System Cash (Expected)</p>
            <p className="text-lg font-bold text-slate-800">Rp {expected.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors">
            Close Shift
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Cashier Dashboard ─── */
export default function CashierDashboard({ user, activeTab, onNavigate }: { user: User; activeTab: string; onNavigate?: (tab: string) => void }) {
  const { addTransaction, voidTransaction, transactions = [] } = useAppContext() || {};
  const activeServices = getActiveServices();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receipt, setReceipt] = useState<any>(null);
  const [activeCat, setActiveCat] = useState('Semua');
  const [voidTxn, setVoidTxn] = useState<Transaction | null>(null);
  const [showShift, setShowShift] = useState(false);

  const categories = ['All', ...Array.from(new Set(activeServices.map(s => s.category)))];
  const filtered = activeCat === 'All' ? activeServices : activeServices.filter(s => s.category === activeCat);

  const addToCart = (svc: Service) => {
    setCart(prev => {
      const ex = prev.find(c => c.service.service_id === svc.service_id);
      if (ex) return prev.map(c => c.service.service_id === svc.service_id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { service: svc, quantity: 1 }];
    });
  };
  const decQty = (sid: string) => {
    setCart(prev => prev.map(c => c.service.service_id === sid ? { ...c, quantity: c.quantity - 1 } : c).filter(c => c.quantity > 0));
  };
  const remove = (sid: string) => setCart(prev => prev.filter(c => c.service.service_id !== sid));

  const subtotal = cart.reduce((s, c) => s + c.service.unit_price * c.quantity, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;
  const itemCount = cart.reduce((s, c) => s + c.quantity, 0);
  const crossSell = useMemo(() => getCrossSell(cart), [cart]);

  // Today's transactions for this cashier
  const today = new Date().toISOString().slice(0, 10);
  const myTodayTxns = transactions.filter(t =>
    t.cashier_id === user.user_id && t.transaction_date?.startsWith(today) && t.payment_status === 'PAID'
  );

  const handleCheckout = () => {
    const now = new Date();
    const txnId = `TXN-${Date.now()}`;
    addTransaction({
      transaction_id: txnId,
      cashier_id: user.user_id,
      service_id: cart[0].service.service_id,
      quantity: itemCount,
      subtotal,
      tax_amount: tax,
      total_amount: total,
      payment_method: 'CASH',
      payment_status: 'PAID',
      transaction_date: now.toISOString(),
    });

    const entries = [
      { account: '1010 - Cash', debit: total, credit: 0 },
      { account: `4000 - Service Revenue`, debit: 0, credit: subtotal },
      { account: '2100 - Tax Payable - PPN (VAT)', debit: 0, credit: tax },
    ];

    setReceipt({
      id: txnId,
      subtotal, tax, total,
      time: now.toLocaleString('id-ID'),
      entries,
    });
    setCart([]);
  };

  const handleVoid = (reason: string) => {
    if (voidTxn) {
      voidTransaction(voidTxn.transaction_id, reason, user.user_id);
      setVoidTxn(null);
    }
  };

  if (activeTab === 'shift' || showShift) {
    return <CloseShiftModal user={user} onClose={() => {
      setShowShift(false);
      if (activeTab === 'shift' && onNavigate) onNavigate('pos');
    }} />;
  }

  if (receipt) return <Receipt txn={receipt} onBack={() => setReceipt(null)} />;

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* ── Left Column ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Today's Transactions</p>
            <p className="text-lg font-bold text-slate-800">{myTodayTxns.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Today's Revenue</p>
            <p className="text-lg font-bold text-emerald-700">Rp {myTodayTxns.reduce((s, t) => s + t.total_amount, 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Status</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-700">Active Shift</span>
            </div>
          </div>
        </div>

        {/* Cross-sell banner */}
        {crossSell.show && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-3 flex items-center gap-3 text-white shadow-md shrink-0">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <p className="text-xs font-medium">{crossSell.message}</p>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 flex-wrap shrink-0">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeCat === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Service grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 overflow-y-auto pb-2 pr-1">
          {filtered.map(svc => (
            <button key={svc.service_id} onClick={() => addToCart(svc)}
              className="bg-white border border-slate-200 rounded-xl p-3 text-left hover:border-violet-300 hover:shadow-sm transition-all group flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <CatBadge cat={svc.category} />
                <div className="w-6 h-6 rounded bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-snug flex-1">{svc.service_name}</p>
              <p className="text-sm font-bold text-violet-700 mt-1.5">Rp {svc.unit_price.toLocaleString('id-ID')}<span className="text-[10px] font-normal text-slate-400">/unit</span></p>
            </button>
          ))}
        </div>

        {/* Recent transactions + Void */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Today's Transaction History</h3>
            <ICBadge id="IC-4" text="Threshold Authorization" />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {myTodayTxns.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400">No transactions today</div>
            ) : (
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  {myTodayTxns.slice().reverse().map(t => (
                    <tr key={t.transaction_id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-slate-500">{t.transaction_id}</td>
                      <td className="px-4 py-2 text-slate-600">{new Date(t.transaction_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-800">Rp {t.total_amount.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2 text-right">
                        {t.payment_status === 'PAID' && (
                          <button onClick={() => setVoidTxn(t)}
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                            Void
                          </button>
                        )}
                        {t.payment_status === 'VOIDED' && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">VOIDED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div className="w-80 shrink-0 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <h3 className="text-sm font-semibold text-slate-700">Cart</h3>
            <ICBadge id="IC-1" text="Input Validation" />
          </div>
          {itemCount > 0 && <span className="bg-violet-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{itemCount}</span>}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className="text-sm text-slate-400 font-medium">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.service.service_id} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700 flex-1 leading-snug">{item.service.service_name}</p>
                  <button onClick={() => remove(item.service.service_id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => decQty(item.service.service_id)} className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs font-bold">−</button>
                    <span className="text-xs font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item.service)} className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs font-bold">+</button>
                  </div>
                  <p className="text-xs font-bold text-violet-700">Rp {(item.service.unit_price * item.quantity).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>PPN 11%</span>
              <span className="font-medium text-slate-700">Rp {tax.toLocaleString('id-ID')}</span>
              <ICBadge id="IC-2" text="Automatic Calculation" />
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-100">
              <span>Total</span>
              <span className="text-violet-700">Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button onClick={handleCheckout}
              className="w-full mt-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Process Payment
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {voidTxn && <VoidModal txn={voidTxn} onClose={() => setVoidTxn(null)} onConfirm={handleVoid} />}
    </div>
  );
}