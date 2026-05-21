import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { User } from './index';
import FinancialStatements from './FinancialStatements';

/* ─── IC Badge ─── */
function ICBadge({ id, text }: { id: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title={text}>
      [{id}]
    </span>
  );
}

/* ─── Tab Button ─── */
function TabBtn({ active, onClick, children }: any) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${active ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
      {children}
    </button>
  );
}

/* ─── Action Badge ─── */
const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-sky-50 text-sky-700 border-sky-200',
  LOGOUT: 'bg-slate-100 text-slate-600 border-slate-200',
  CREATE_TRANSACTION: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VOID_TRANSACTION: 'bg-red-50 text-red-700 border-red-200',
  APPROVE_EXPENSE: 'bg-violet-50 text-violet-700 border-violet-200',
  REJECT_EXPENSE: 'bg-rose-50 text-rose-700 border-rose-200',
  CLOSE_SHIFT: 'bg-amber-50 text-amber-700 border-amber-200',
  GENERATE_PO: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  RECEIVE_GOODS: 'bg-blue-50 text-blue-700 border-blue-200',
  PAY_BILL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  default: 'bg-slate-100 text-slate-600 border-slate-200',
};

function ActBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] || ACTION_COLORS.default;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls} whitespace-nowrap`}>{action.replace(/_/g, ' ')}</span>;
}

/* ─── Anomaly Severity ─── */
function SevBadge({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    HIGH: 'bg-red-50 text-red-700 border-red-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[sev] || map.LOW}`}>{sev}</span>;
}

/* ─── Main Auditor Dashboard ─── */
export default function AuditorDashboard({ user: _user, activeTab: _activeTab }: { user: User; activeTab: string }) {
  const {
    journalEntries = [],
    auditTrail = [],
    transactions = [],
  } = useAppContext() || {};

  const [tab, setTab] = useState<'journal' | 'audit' | 'trial' | 'anomaly' | 'financials'>('journal');
  const [search, setSearch] = useState('');

  const trialBalance = useMemo(() => {
    
    // Rumus Otomatis Pembuatan Neraca Saldo jika Context tidak memilikinya
    const balances: Record<string, { code: string, name: string, debit: number, credit: number }> = {};
    
    journalEntries.forEach(j => {
      if (j.debit_account) {
        const [code, ...nameParts] = j.debit_account.split(' - ');
        if (!balances[code]) balances[code] = { code, name: nameParts.join(' - ') || code, debit: 0, credit: 0 };
        balances[code].debit += j.amount;
      }
      if (j.credit_account) {
        const [code, ...nameParts] = j.credit_account.split(' - ');
        if (!balances[code]) balances[code] = { code, name: nameParts.join(' - ') || code, debit: 0, credit: 0 };
        balances[code].credit += j.amount;
      }
    });

    return Object.values(balances).map(b => {
      const net = b.debit - b.credit;
      let type = 'ASSET';
      if (b.code.startsWith('2')) type = 'LIABILITY';
      if (b.code.startsWith('3')) type = 'EQUITY';
      if (b.code.startsWith('4')) type = 'REVENUE';
      if (b.code.startsWith('5') || b.code.startsWith('6')) type = 'EXPENSE';
      return {
        account_code: b.code, account_name: b.name, account_type: type,
        debit_balance: net > 0 ? net : 0, credit_balance: net < 0 ? -net : 0
      };
    }).sort((a, b) => a.account_code.localeCompare(b.account_code));
  }, [journalEntries]);

  const anomalies = useMemo(() => {
    
    // Deteksi Anomali / Red Flags Otomatis
    const result: any[] = [];
    transactions.forEach(t => {
      if (t.payment_status === 'VOIDED') {
        result.push({ anomaly_id: `ANOM-V-${t.transaction_id}`, type: 'VOIDED_TRANSACTION', severity: 'HIGH', description: `Transaksi Rp ${t.total_amount.toLocaleString('id-ID')} dibatalkan oleh user.`, transaction_id: t.transaction_id, detected_at: t.transaction_date });
      } else if (t.total_amount > 500000) {
        result.push({ anomaly_id: `ANOM-L-${t.transaction_id}`, type: 'UNUSUAL_LARGE_AMOUNT', severity: 'MEDIUM', description: `Transaksi di atas limit normal (Rp ${t.total_amount.toLocaleString('id-ID')}).`, transaction_id: t.transaction_id, detected_at: t.transaction_date });
      }
    });
    return result.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
  }, [transactions]);

  const totalDebit = trialBalance.reduce((s: number, t: any) => s + t.debit_balance, 0);
  const totalCredit = trialBalance.reduce((s: number, t: any) => s + t.credit_balance, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const filteredJournals = journalEntries.filter(j =>
    !search || j.transaction_ref.toLowerCase().includes(search.toLowerCase()) ||
    j.debit_account.toLowerCase().includes(search.toLowerCase()) ||
    j.credit_account.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAudit = auditTrail.filter(a =>
    !search || a.user_id.toLowerCase().includes(search.toLowerCase()) ||
    a.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-violet-600 text-white rounded-xl p-4">
          <p className="text-[10px] opacity-70 uppercase tracking-wider">Total Journals</p>
          <p className="text-xl font-bold">{journalEntries.length}</p>
          <p className="text-[10px] opacity-60 mt-0.5">Double-entry records</p>
        </div>
        <div className="bg-emerald-600 text-white rounded-xl p-4">
          <p className="text-[10px] opacity-70 uppercase tracking-wider">Total Debit</p>
          <p className="text-xl font-bold">Rp {totalDebit.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-sky-600 text-white rounded-xl p-4">
          <p className="text-[10px] opacity-70 uppercase tracking-wider">Total Credit</p>
          <p className="text-xl font-bold">Rp {totalCredit.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-slate-700 text-white rounded-xl p-4">
          <p className="text-[10px] opacity-70 uppercase tracking-wider">Activity Logs</p>
          <p className="text-xl font-bold">{auditTrail.length}</p>
          <p className="text-[10px] opacity-60 mt-0.5">Immutable audit trail</p>
        </div>
      </div>

      {/* Read-only notice */}
      <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        <p className="text-xs text-amber-700 font-medium">
          Mode <span className="font-bold">READ-ONLY</span> — Auditor cannot modify data.
          <ICBadge id="IC-3" text="Segregation of Duties" />
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="border-b border-slate-100 px-5 flex gap-1 flex-wrap">
          <TabBtn active={tab === 'journal'} onClick={() => setTab('journal')}>
            Journal Book <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{journalEntries.length}</span>
          </TabBtn>
          <TabBtn active={tab === 'trial'} onClick={() => setTab('trial')}>
            Trial Balance <ICBadge id="IC-7" text="Reconciliation Check" />
          </TabBtn>
          <TabBtn active={tab === 'financials'} onClick={() => setTab('financials')}>
            Financial Statements <ICBadge id="IC-9" text="Reporting" />
          </TabBtn>
          <TabBtn active={tab === 'anomaly'} onClick={() => setTab('anomaly')}>
            Anomalies <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{anomalies.length}</span>
          </TabBtn>
          <TabBtn active={tab === 'audit'} onClick={() => setTab('audit')}>
            Audit Trail <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{auditTrail.length}</span>
          </TabBtn>
        </div>

        {/* Search */}
        {(tab === 'journal' || tab === 'audit') && (
          <div className="px-5 py-3 border-b border-slate-100">
            <div className="relative max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-xs w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-400" />
            </div>
          </div>
        )}

        {/* ── Journal Tab ── */}
        {tab === 'journal' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="text-left px-5 py-3 font-medium">ID</th>
                  <th className="text-left px-5 py-3 font-medium">Ref</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Debit</th>
                  <th className="text-left px-5 py-3 font-medium">Credit</th>
                  <th className="text-right px-5 py-3 font-medium">Amount</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJournals.map((j, idx) => (
                  <tr key={j.journal_id} className={`hover:bg-slate-50/70 ${idx % 2 ? 'bg-slate-50/30' : ''}`}>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{j.journal_id.slice(0, 20)}...</td>
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-violet-700">{j.transaction_ref}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{new Date(j.entry_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-5 py-3"><span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">D: {j.debit_account}</span></td>
                    <td className="px-5 py-3"><span className="text-xs font-medium text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg">K: {j.credit_account}</span></td>
                    <td className="px-5 py-3 text-right font-mono text-sm font-bold text-slate-800">{j.amount.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{j.entry_type}</span></td>
                  </tr>
                ))}
                {filteredJournals.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No data</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Trial Balance Tab ── */}
        {tab === 'trial' && (
          <div>
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-700">Trial Balance</h3>
                <ICBadge id="IC-7" text="Reconciliation Check" />
              </div>
              <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border ${isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isBalanced ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg>
                {isBalanced ? 'BALANCED' : 'IMBALANCED'}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                    <th className="text-left px-5 py-3 font-medium">Code</th>
                    <th className="text-left px-5 py-3 font-medium">Account Name</th>
                    <th className="text-left px-5 py-3 font-medium">Type</th>
                    <th className="text-right px-5 py-3 font-medium">Debit (Rp)</th>
                    <th className="text-right px-5 py-3 font-medium">Credit (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trialBalance.map((tb: any) => (
                    <tr key={tb.account_code} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">{tb.account_code}</td>
                      <td className="px-5 py-3 text-xs font-medium text-slate-700">{tb.account_name}</td>
                      <td className="px-5 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{tb.account_type}</span></td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-700">{tb.debit_balance > 0 ? tb.debit_balance.toLocaleString('id-ID') : '—'}</td>
                      <td className="px-5 py-3 text-right font-mono text-sky-700">{tb.credit_balance > 0 ? tb.credit_balance.toLocaleString('id-ID') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={3} className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Total</td>
                    <td className="px-5 py-3 text-right font-bold font-mono text-emerald-700">{totalDebit.toLocaleString('id-ID')}</td>
                    <td className="px-5 py-3 text-right font-bold font-mono text-sky-700">{totalCredit.toLocaleString('id-ID')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ── Financial Statements Tab (Auditor View) ── */}
        {tab === 'financials' && (
          <div className="p-5">
            <FinancialStatements journalEntries={journalEntries} entityName="Woyla Photocopy" showICBadge />
          </div>
        )}

        {/* ── Anomaly Tab ── */}
        {tab === 'anomaly' && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-700">Early Warning System (Anomaly Detection)</h3>
              <ICBadge id="IC-8" text="Anomaly Notification" />
            </div>
            {anomalies.length === 0 && <div className="text-sm text-slate-400 text-center py-8">No anomalies detected</div>}
            {anomalies.map((a: any) => (
              <div key={a.anomaly_id} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-bold text-red-800">{a.type.replace(/_/g, ' ')}</p>
                    <SevBadge sev={a.severity} />
                  </div>
                  <p className="text-xs text-red-700">{a.description}</p>
                  {a.transaction_id && <p className="text-[10px] font-mono text-red-500 mt-0.5">Ref: {a.transaction_id}</p>}
                </div>
                <span className="text-[10px] text-red-400 shrink-0">{new Date(a.detected_at).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Audit Trail Tab ── */}
        {tab === 'audit' && (
          <div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredAudit.length === 0 && <div className="px-5 py-10 text-center text-slate-400 text-sm">No logs</div>}
              {filteredAudit.map((a, idx) => (
                <div key={a.audit_id} className={`px-5 py-3.5 flex items-start gap-4 hover:bg-slate-50/70 ${idx % 2 ? 'bg-slate-50/20' : ''}`}>
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <div className="w-2 h-2 bg-violet-400 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">{new Date(a.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-xs font-bold text-slate-700 shrink-0">{a.user_id}</span>
                    <ActBadge action={a.action} />
                    <span className="text-xs text-slate-500">Module: <b className="text-slate-600">{a.module}</b></span>
                    {a.target_id && <span className="text-[11px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">→ {a.target_id}</span>}
                    {a.details && <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{a.details}</span>}
                  </div>
                  <ICBadge id="IC-5" text="Immutable audit trail" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}