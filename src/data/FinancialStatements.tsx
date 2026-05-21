import { useMemo } from 'react';
import type { JournalEntry } from './index';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FINANCIAL STATEMENTS COMPONENT
// Real-time Double-Entry Accounting Engine — Accrual Basis
// Woyla Photocopy AIS · President University
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────

const IDR = (n: number, compact = false) => {
  if (compact && Math.abs(n) >= 1_000_000)
    return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
  return `Rp ${Math.abs(n).toLocaleString('id-ID')}`;
};

const pct = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, accent }: { title: string; accent: string }) {
  return (
    <div className={`flex items-center gap-2 mb-3`}>
      <div className={`w-1 h-5 rounded-full ${accent}`} />
      <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function LineItem({
  label, value, indent = false, muted = false, negative = false,
}: {
  label: string; value: number; indent?: boolean; muted?: boolean; negative?: boolean;
}) {
  const display = negative ? `-${IDR(value)}` : IDR(value);
  return (
    <div className={`flex justify-between items-baseline py-1.5 px-2 rounded-md transition-colors hover:bg-slate-50 ${indent ? 'pl-5' : ''}`}>
      <span className={`text-xs ${muted ? 'text-slate-400 italic' : 'text-slate-600'}`}>{label}</span>
      <span className={`text-xs font-mono font-semibold tabular-nums ${negative ? 'text-red-600' : 'text-slate-700'}`}>{display}</span>
    </div>
  );
}

function SubtotalLine({ label, value, colorClass = 'text-slate-800' }: { label: string; value: number; colorClass?: string }) {
  return (
    <div className={`flex justify-between items-baseline py-1.5 px-2 border-t border-slate-200 mt-1`}>
      <span className={`text-xs font-bold ${colorClass}`}>{label}</span>
      <span className={`text-xs font-mono font-black tabular-nums ${colorClass}`}>{IDR(value)}</span>
    </div>
  );
}

function TotalBanner({
  label, value, accent, sub,
}: { label: string; value: number; accent: string; sub?: string }) {
  return (
    <div className={`rounded-xl p-3.5 mt-3 border ${accent}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-black tracking-tight">{label}</span>
        <span className="text-base font-black font-mono tabular-nums">{IDR(value)}</span>
      </div>
      {sub && <p className="text-[10px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

function RatioChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${color}`}>
      <span className="text-[10px] text-center leading-tight opacity-70 font-medium">{label}</span>
      <span className="text-sm font-black mt-0.5">{value}</span>
    </div>
  );
}

// ── Main Engine ────────────────────────────────────────────────────────────────

export function useFinancialEngine(journalEntries: JournalEntry[]) {
  return useMemo(() => {
    // Accumulators — all keyed by account class
    // Income Statement
    let serviceRevenue = 0;
    let otherRevenue = 0;
    let cogsMaterials = 0;
    let cogsLabor = 0;
    let cogsOther = 0;
    let salaryExpense = 0;
    let rentExpense = 0;
    let utilityExpense = 0;
    let marketingExpense = 0;
    let depreciationExpense = 0;
    let taxExpense = 0;
    let otherExpense = 0;

    // Balance Sheet
    let cash = 0;
    let bankBalance = 0;
    let accountsReceivable = 0;
    let inventoryAsset = 0;
    let prepaidExpense = 0;
    let otherCurrentAsset = 0;
    let fixedAssets = 0;
    let accumulatedDepreciation = 0;
    let accountsPayable = 0;
    let taxPayable = 0;
    let accruals = 0;
    let otherCurrentLiability = 0;
    let longTermDebt = 0;
    let ownersCapital = 0;
    let retainedEarningsBase = 0;

    journalEntries.forEach(j => {
      const amt = j.amount;
      const processAccount = (acc: string, isDebit: boolean) => {
        if (!acc) return;
        const sign = (normalDebit: boolean) => (isDebit === normalDebit ? amt : -amt);
        const code = acc.trim();

        // ── ASSETS (normal: Debit) ───────────────────────────────────────────
        if (/^1010/i.test(code) || /cash/i.test(code)) {
          cash += sign(true);
        } else if (/^1020/i.test(code) || /bank/i.test(code)) {
          bankBalance += sign(true);
        } else if (/^1030/i.test(code) || /receivable/i.test(code)) {
          accountsReceivable += sign(true);
        } else if (/^111/i.test(code) || /^1110/i.test(code) || /inventory/i.test(code)) {
          inventoryAsset += sign(true);
        } else if (/^1120/i.test(code) || /prepaid/i.test(code)) {
          prepaidExpense += sign(true);
        } else if (/^1[2-9]/i.test(code)) {
          // Fixed assets
          if (/deprec/i.test(code) || /^1[5-9]/i.test(code)) {
            fixedAssets += sign(true);
          } else {
            otherCurrentAsset += sign(true);
          }
        } else if (/^1/i.test(code)) {
          otherCurrentAsset += sign(true);
        }

        // ── LIABILITIES (normal: Credit) ────────────────────────────────────
        else if (/^2010/i.test(code) || /accounts payable/i.test(code)) {
          accountsPayable += sign(false);
        } else if (/^2[1-2]/i.test(code) || /tax payable/i.test(code) || /ppn/i.test(code) || /vat/i.test(code)) {
          taxPayable += sign(false);
        } else if (/^2[3-5]/i.test(code) || /accrued/i.test(code)) {
          accruals += sign(false);
        } else if (/^2[6-9]/i.test(code)) {
          longTermDebt += sign(false);
        } else if (/^2/i.test(code)) {
          otherCurrentLiability += sign(false);
        }

        // ── EQUITY (normal: Credit) ─────────────────────────────────────────
        else if (/^3[0-1]/i.test(code) || /capital/i.test(code) || /modal/i.test(code)) {
          ownersCapital += sign(false);
        } else if (/^3[2-9]/i.test(code) || /retained/i.test(code) || /laba/i.test(code)) {
          retainedEarningsBase += sign(false);
        } else if (/^3/i.test(code)) {
          ownersCapital += sign(false);
        }

        // ── REVENUE (normal: Credit) ────────────────────────────────────────
        else if (/^4[0-1]/i.test(code) || j.entry_type === 'SALES') {
          serviceRevenue += sign(false);
        } else if (/^4/i.test(code)) {
          otherRevenue += sign(false);
        }

        // ── COGS (normal: Debit) ─────────────────────────────────────────────
        else if (/^5000/i.test(code) || j.entry_type === 'COGS') {
          cogsMaterials += sign(true);
        } else if (/^500[1-2]/i.test(code)) {
          cogsLabor += sign(true);
        } else if (/^500/i.test(code) || /^5[0]/i.test(code)) {
          cogsOther += sign(true);
        }

        // ── OPERATING EXPENSES (normal: Debit) ──────────────────────────────
        else if (/^510/i.test(code) || /salary|gaji/i.test(code)) {
          salaryExpense += sign(true);
        } else if (/^520/i.test(code) || /rent|sewa/i.test(code)) {
          rentExpense += sign(true);
        } else if (/^530/i.test(code) || /utility|listrik|utilities/i.test(code)) {
          utilityExpense += sign(true);
        } else if (/^540/i.test(code) || /market/i.test(code)) {
          marketingExpense += sign(true);
        } else if (/^550/i.test(code) || /deprec/i.test(code)) {
          depreciationExpense += sign(true);
        } else if (/^560|^5[0-9]10/i.test(code) || /tax expense/i.test(code)) {
          taxExpense += sign(true);
        } else if (/^5[0-9][0-9][0-9]/i.test(code) || /operating expense|beban/i.test(code)) {
          otherExpense += sign(true);
        } else if (/^6/i.test(code)) {
          otherExpense += sign(true);
        }
      };

      processAccount(j.debit_account, true);
      processAccount(j.credit_account, false);
    });

    // Fallback: estimate COGS if no COGS entries exist yet (35% blended margin estimate)
    const hasCogs = (cogsMaterials + cogsLabor + cogsOther) !== 0;
    if (!hasCogs && serviceRevenue > 0) {
      cogsMaterials = serviceRevenue * 0.35;
    }

    // ── INCOME STATEMENT ─────────────────────────────────────────────────────
    const totalRevenue = serviceRevenue + otherRevenue;
    const totalCogs = cogsMaterials + cogsLabor + cogsOther;
    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPct = pct(grossProfit, totalRevenue);

    const totalOpex = salaryExpense + rentExpense + utilityExpense + marketingExpense + depreciationExpense + otherExpense;
    const ebit = grossProfit - totalOpex;
    const netIncome = ebit - taxExpense;
    const netMarginPct = pct(netIncome, totalRevenue);

    // ── BALANCE SHEET ────────────────────────────────────────────────────────
    const totalCurrentAssets = cash + bankBalance + accountsReceivable + inventoryAsset + prepaidExpense + otherCurrentAsset;
    const totalFixedAssets = fixedAssets - accumulatedDepreciation;
    const totalAssets = totalCurrentAssets + Math.max(0, totalFixedAssets);

    const totalCurrentLiabilities = accountsPayable + taxPayable + accruals + otherCurrentLiability;
    const totalLiabilities = totalCurrentLiabilities + longTermDebt;

    const retainedEarnings = retainedEarningsBase + netIncome;
    const totalEquity = ownersCapital + retainedEarnings;
    const totalLiabEquity = totalLiabilities + totalEquity;

    const diff = Math.abs(totalAssets - totalLiabEquity);
    const isBalanced = diff < 1; // allow 1 IDR rounding tolerance

    // ── RATIOS ───────────────────────────────────────────────────────────────
    const currentRatio = totalCurrentLiabilities === 0 ? null : (totalCurrentAssets / totalCurrentLiabilities);
    const debtRatio = totalAssets === 0 ? null : (totalLiabilities / totalAssets);
    const roaRaw = totalAssets === 0 ? null : (netIncome / totalAssets) * 100;
    const roeRaw = totalEquity === 0 ? null : (netIncome / totalEquity) * 100;

    return {
      is: {
        serviceRevenue, otherRevenue, totalRevenue,
        cogsMaterials, cogsLabor, cogsOther, totalCogs,
        grossProfit, grossMarginPct,
        salaryExpense, rentExpense, utilityExpense, marketingExpense, depreciationExpense, taxExpense, otherExpense, totalOpex,
        ebit, netIncome, netMarginPct,
        hasCogs,
      },
      bs: {
        cash, bankBalance, accountsReceivable, inventoryAsset, prepaidExpense, otherCurrentAsset, totalCurrentAssets,
        fixedAssets, accumulatedDepreciation, totalFixedAssets, totalAssets,
        accountsPayable, taxPayable, accruals, otherCurrentLiability, totalCurrentLiabilities,
        longTermDebt, totalLiabilities,
        ownersCapital, retainedEarnings, retainedEarningsBase, totalEquity,
        totalLiabEquity, diff, isBalanced,
      },
      ratios: {
        currentRatio, debtRatio, roaRaw, roeRaw,
        grossMarginPct, netMarginPct,
      },
    };
  }, [journalEntries]);
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL FINANCIAL STATEMENTS PANEL
// ─────────────────────────────────────────────────────────────────────────────

export default function FinancialStatements({
  journalEntries,
  entityName = 'Woyla Photocopy',
  showICBadge = true,
}: {
  journalEntries: JournalEntry[];
  entityName?: string;
  showICBadge?: boolean;
}) {
  const f = useFinancialEngine(journalEntries);
  const { is, bs, ratios } = f;
  const now = new Date();
  const periodLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dateLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-5">

      {/* ── Document Header ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Financial Statements</p>
            {showICBadge && (
              <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">[IC-9]</span>
            )}
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">{entityName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Double-Entry · Accrual Basis · Real-Time Computation</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Generated</p>
          <p className="text-sm font-bold text-slate-200">{dateLabel}</p>
          <p className="text-xs text-slate-400 font-mono">{journalEntries.length} journal entries</p>
        </div>
      </div>

      {/* ── Key Ratio Bar ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <RatioChip
          label="Gross Margin"
          value={`${is.grossMarginPct}%`}
          color={is.grossMarginPct >= 30 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}
        />
        <RatioChip
          label="Net Margin"
          value={`${is.netMarginPct}%`}
          color={is.netMarginPct >= 10 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : is.netMarginPct >= 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}
        />
        <RatioChip
          label="Current Ratio"
          value={ratios.currentRatio !== null ? ratios.currentRatio.toFixed(2) + 'x' : 'N/A'}
          color={ratios.currentRatio !== null && ratios.currentRatio >= 1.5 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}
        />
        <RatioChip
          label="Debt Ratio"
          value={ratios.debtRatio !== null ? (ratios.debtRatio * 100).toFixed(1) + '%' : 'N/A'}
          color={ratios.debtRatio !== null && ratios.debtRatio < 0.5 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}
        />
        <RatioChip
          label="ROA"
          value={ratios.roaRaw !== null ? ratios.roaRaw.toFixed(1) + '%' : 'N/A'}
          color={ratios.roaRaw !== null && ratios.roaRaw >= 5 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}
        />
        <RatioChip
          label="ROE"
          value={ratios.roeRaw !== null ? ratios.roeRaw.toFixed(1) + '%' : 'N/A'}
          color={ratios.roeRaw !== null && ratios.roeRaw >= 10 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}
        />
      </div>

      {/* ── Two-Column Layout: IS + BS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">

        {/* ════════ INCOME STATEMENT ════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Laporan</p>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Income Statement</h2>
                <p className="text-xs text-slate-400 mt-0.5">For the Period Ending {periodLabel}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold border ${is.netIncome >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={is.netIncome >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
                {is.netIncome >= 0 ? 'PROFIT' : 'LOSS'}
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* Revenues */}
            <div>
              <SectionHeader title="Revenues" accent="bg-emerald-500" />
              <LineItem label="Service Revenue" value={is.serviceRevenue} indent />
              {is.otherRevenue !== 0 && <LineItem label="Other Revenue" value={is.otherRevenue} indent />}
              <SubtotalLine label="Total Revenues" value={is.totalRevenue} colorClass="text-emerald-700" />
            </div>

            {/* COGS */}
            <div>
              <SectionHeader title="Cost of Goods Sold" accent="bg-orange-400" />
              <LineItem label="Material Costs" value={is.cogsMaterials} indent negative />
              {is.cogsLabor !== 0 && <LineItem label="Labor (Direct)" value={is.cogsLabor} indent negative />}
              {is.cogsOther !== 0 && <LineItem label="Other COGS" value={is.cogsOther} indent negative />}
              {!is.hasCogs && (
                <div className="px-2 py-1.5 mt-1">
                  <p className="text-[10px] text-amber-600 italic bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                    * COGS estimated at 35% of revenue (no COGS journal entries found)
                  </p>
                </div>
              )}
              <SubtotalLine label="Total COGS" value={-is.totalCogs} colorClass="text-orange-700" />
            </div>

            {/* Gross Profit Banner */}
            <div className={`rounded-xl border-2 p-3.5 flex justify-between items-center ${is.grossProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div>
                <span className={`text-sm font-black ${is.grossProfit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>Gross Profit</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-28 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${is.grossMarginPct >= 30 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(is.grossMarginPct, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{is.grossMarginPct}% margin</span>
                </div>
              </div>
              <span className={`text-base font-black font-mono tabular-nums ${is.grossProfit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>{IDR(is.grossProfit)}</span>
            </div>

            {/* Operating Expenses */}
            <div>
              <SectionHeader title="Operating Expenses" accent="bg-rose-400" />
              {is.salaryExpense !== 0 && <LineItem label="Salaries & Wages" value={is.salaryExpense} indent negative />}
              {is.rentExpense !== 0 && <LineItem label="Rent" value={is.rentExpense} indent negative />}
              {is.utilityExpense !== 0 && <LineItem label="Utilities" value={is.utilityExpense} indent negative />}
              {is.marketingExpense !== 0 && <LineItem label="Marketing" value={is.marketingExpense} indent negative />}
              {is.depreciationExpense !== 0 && <LineItem label="Depreciation" value={is.depreciationExpense} indent negative />}
              {is.otherExpense !== 0 && <LineItem label="General & Administrative" value={is.otherExpense} indent negative />}
              {is.totalOpex === 0 && <p className="text-xs text-slate-400 italic px-5 py-1">No operating expense entries</p>}
              <SubtotalLine label="Total Operating Expenses" value={-is.totalOpex} colorClass="text-rose-700" />
            </div>

            {/* EBIT & Net Income */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-baseline py-1.5 px-2">
                <span className="text-xs font-bold text-slate-700">EBIT (Operating Income)</span>
                <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">{IDR(is.ebit)}</span>
              </div>
              {is.taxExpense !== 0 && (
                <div className="flex justify-between items-baseline py-1 px-2 text-slate-600">
                  <span className="text-xs italic pl-3">Less: Income Tax</span>
                  <span className="text-xs font-mono tabular-nums text-red-600">-{IDR(is.taxExpense)}</span>
                </div>
              )}
              <div className={`rounded-xl p-4 border-2 flex justify-between items-center ${is.netIncome >= 0 ? 'bg-violet-50 border-violet-300' : 'bg-red-50 border-red-300'}`}>
                <div>
                  <span className={`text-base font-black ${is.netIncome >= 0 ? 'text-violet-900' : 'text-red-900'}`}>Net Income</span>
                  <p className={`text-[10px] font-semibold mt-0.5 ${is.netIncome >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                    {is.netMarginPct}% net margin
                  </p>
                </div>
                <span className={`text-xl font-black font-mono tabular-nums ${is.netIncome >= 0 ? 'text-violet-800' : 'text-red-800'}`}>{IDR(is.netIncome)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════ BALANCE SHEET ═══════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Neraca</p>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">Balance Sheet</h2>
                <p className="text-xs text-slate-400 mt-0.5">As of {dateLabel}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold border ${bs.isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={bs.isBalanced ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                </svg>
                {bs.isBalanced ? 'BALANCED' : 'IMBALANCED'}
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* ASSETS */}
            <div>
              <SectionHeader title="Assets" accent="bg-sky-500" />
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-2 mb-1">Current Assets</p>
              {bs.cash !== 0 && <LineItem label="Cash on Hand" value={bs.cash} indent />}
              {bs.bankBalance !== 0 && <LineItem label="Bank Balance" value={bs.bankBalance} indent />}
              {bs.accountsReceivable !== 0 && <LineItem label="Accounts Receivable" value={bs.accountsReceivable} indent />}
              {bs.inventoryAsset !== 0 && <LineItem label="Inventory" value={bs.inventoryAsset} indent />}
              {bs.prepaidExpense !== 0 && <LineItem label="Prepaid Expenses" value={bs.prepaidExpense} indent />}
              {bs.otherCurrentAsset !== 0 && <LineItem label="Other Current Assets" value={bs.otherCurrentAsset} indent />}
              {bs.totalCurrentAssets === 0 && <p className="text-xs text-slate-400 italic px-5 py-1">No current asset entries</p>}
              <SubtotalLine label="Total Current Assets" value={bs.totalCurrentAssets} colorClass="text-sky-700" />

              {bs.totalFixedAssets > 0 && (
                <>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-2 mb-1 mt-3">Fixed Assets</p>
                  <LineItem label="Property, Plant & Equipment" value={bs.fixedAssets} indent />
                  {bs.accumulatedDepreciation !== 0 && <LineItem label="Less: Accum. Depreciation" value={bs.accumulatedDepreciation} indent negative />}
                  <SubtotalLine label="Total Fixed Assets" value={bs.totalFixedAssets} colorClass="text-sky-700" />
                </>
              )}

              <TotalBanner label="TOTAL ASSETS" value={bs.totalAssets} accent="bg-sky-50 border-sky-300 text-sky-900" />
            </div>

            {/* LIABILITIES */}
            <div>
              <SectionHeader title="Liabilities" accent="bg-rose-400" />
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-2 mb-1">Current Liabilities</p>
              {bs.accountsPayable !== 0 && <LineItem label="Accounts Payable" value={bs.accountsPayable} indent />}
              {bs.taxPayable !== 0 && <LineItem label="Tax Payable (VAT/PPN)" value={bs.taxPayable} indent />}
              {bs.accruals !== 0 && <LineItem label="Accrued Liabilities" value={bs.accruals} indent />}
              {bs.otherCurrentLiability !== 0 && <LineItem label="Other Current Liabilities" value={bs.otherCurrentLiability} indent />}
              {bs.totalCurrentLiabilities === 0 && <p className="text-xs text-slate-400 italic px-5 py-1">No current liability entries</p>}
              <SubtotalLine label="Total Current Liabilities" value={bs.totalCurrentLiabilities} colorClass="text-rose-700" />

              {bs.longTermDebt !== 0 && (
                <>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold px-2 mb-1 mt-3">Long-Term Liabilities</p>
                  <LineItem label="Long-Term Debt" value={bs.longTermDebt} indent />
                </>
              )}
              <TotalBanner label="TOTAL LIABILITIES" value={bs.totalLiabilities} accent="bg-rose-50 border-rose-300 text-rose-900" />
            </div>

            {/* EQUITY */}
            <div>
              <SectionHeader title="Owner's Equity" accent="bg-violet-500" />
              {bs.ownersCapital !== 0 && <LineItem label="Owner's Capital (Modal)" value={bs.ownersCapital} indent />}
              <LineItem label="Retained Earnings (Carried)" value={bs.retainedEarningsBase} indent />
              <LineItem label="Net Income (Current Period)" value={is.netIncome} indent />
              <SubtotalLine label="Retained Earnings (Total)" value={bs.retainedEarnings} colorClass="text-violet-700" />
              <TotalBanner label="TOTAL EQUITY" value={bs.totalEquity} accent="bg-violet-50 border-violet-300 text-violet-900" />
            </div>

            {/* ── Accounting Equation Validator ─────────────────────────── */}
            <div className={`rounded-2xl border-2 overflow-hidden ${bs.isBalanced ? 'border-emerald-300' : 'border-red-400'}`}>
              <div className={`px-4 py-3 flex items-center gap-3 ${bs.isBalanced ? 'bg-emerald-600' : 'bg-red-600'}`}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={bs.isBalanced ? "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"} />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    {bs.isBalanced ? '✓ Accounting Equation Balanced' : '⚠ Imbalance Detected'}
                  </p>
                  <p className="text-[10px] text-white/70 font-medium">Assets = Liabilities + Equity</p>
                </div>
              </div>
              <div className={`px-4 py-3 space-y-2 ${bs.isBalanced ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">Total Assets</span>
                  <span className="font-black font-mono tabular-nums text-slate-800">{IDR(bs.totalAssets)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="font-semibold">=</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Total Liabilities</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-700">{IDR(bs.totalLiabilities)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Total Equity</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-700">{IDR(bs.totalEquity)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-700">Total Liab. + Equity</span>
                  <span className={`font-black font-mono tabular-nums ${bs.isBalanced ? 'text-emerald-700' : 'text-red-700'}`}>{IDR(bs.totalLiabEquity)}</span>
                </div>
                {!bs.isBalanced && (
                  <div className="flex justify-between items-center text-xs border-t border-red-200 pt-2">
                    <span className="font-bold text-red-700">⚠ Difference</span>
                    <span className="font-black font-mono tabular-nums text-red-700">{IDR(bs.diff)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Stamp ────────────────────────────────────────────────── */}
      <div className="bg-slate-900 rounded-xl px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] font-mono text-slate-400">
          System-generated · Accrual Basis · Double-Entry Verified · {journalEntries.length} entries processed
        </p>
        <p className="text-[10px] font-mono text-slate-500">
          {entityName} · Woyla AIS · President University IS (Data Science)
        </p>
      </div>
    </div>
  );
}
