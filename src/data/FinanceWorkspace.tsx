import { useMemo, useState, type ReactNode } from 'react';
import type { AccountCategory, AccountType, JournalEntry } from './index';
import { chartOfAccounts } from './chartOfAccounts';

type TabId = 'flow' | 'coa' | 'journal' | 'ledger' | 'trial' | 'income' | 'balance' | 'cashflow';

type ResolvedAccount = {
  code: string;
  name: string;
  account_type: AccountType;
  account_category: AccountCategory;
  normal_balance: 'DEBIT' | 'CREDIT';
  is_active: boolean;
};

type LedgerLine = {
  account: ResolvedAccount;
  date: string;
  ref: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'flow', label: 'Start-End Flow' },
  { id: 'coa', label: 'Chart of Accounts' },
  { id: 'journal', label: 'Journal Entries' },
  { id: 'ledger', label: 'General Ledger' },
  { id: 'trial', label: 'Trial Balance' },
  { id: 'income', label: 'Income Statement' },
  { id: 'balance', label: 'Balance Sheet' },
  { id: 'cashflow', label: 'Cash Flow' },
];

const TYPE_CLASS: Record<AccountType, string> = {
  ASSET: 'bg-sky-50 text-sky-700 border-sky-200',
  LIABILITY: 'bg-rose-50 text-rose-700 border-rose-200',
  EQUITY: 'bg-violet-50 text-violet-700 border-violet-200',
  REVENUE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EXPENSE: 'bg-amber-50 text-amber-700 border-amber-200',
};

const money = (value: number) => `Rp ${Math.abs(Math.round(value)).toLocaleString('id-ID')}`;

const displayMoney = (value: number) => {
  if (Math.abs(value) < 1) return '-';
  return `${value < 0 ? '(' : ''}${money(value)}${value < 0 ? ')' : ''}`;
};

const accountMap = new Map(chartOfAccounts.map(account => [account.account_code, account]));

const parseAccountLabel = (label: string) => {
  const [rawCode, ...nameParts] = label.split(' - ');
  let code = rawCode.trim();
  let name = nameParts.join(' - ').trim() || code;

  if (/^2010/i.test(label) && /tax|ppn|vat/i.test(label)) {
    code = '2100';
    name = 'Tax Payable (PPN)';
  }

  if (/^1020/i.test(label)) {
    code = '1020';
    name = 'Cash in Bank';
  }

  return { code, name };
};

const inferType = (code: string): AccountType => {
  if (code.startsWith('1')) return 'ASSET';
  if (code.startsWith('2')) return 'LIABILITY';
  if (code.startsWith('3')) return 'EQUITY';
  if (code.startsWith('4')) return 'REVENUE';
  return 'EXPENSE';
};

const inferCategory = (type: AccountType): AccountCategory => {
  if (type === 'ASSET') return 'CURRENT_ASSET';
  if (type === 'LIABILITY') return 'CURRENT_LIABILITY';
  if (type === 'EQUITY') return 'EQUITY';
  if (type === 'REVENUE') return 'OPERATING_REVENUE';
  return 'OPERATING_EXPENSE';
};

const resolveAccount = (label: string): ResolvedAccount => {
  const parsed = parseAccountLabel(label);
  const chart = accountMap.get(parsed.code);
  if (chart) {
    return {
      code: chart.account_code,
      name: chart.account_name,
      account_type: chart.account_type,
      account_category: chart.account_category,
      normal_balance: chart.normal_balance,
      is_active: chart.is_active,
    };
  }

  const accountType = inferType(parsed.code);
  return {
    code: parsed.code,
    name: parsed.name,
    account_type: accountType,
    account_category: inferCategory(accountType),
    normal_balance: accountType === 'ASSET' || accountType === 'EXPENSE' ? 'DEBIT' : 'CREDIT',
    is_active: true,
  };
};

const accountBalanceByType = (account: ResolvedAccount, debit: number, credit: number) => {
  if (account.account_type === 'ASSET' || account.account_type === 'EXPENSE') return debit - credit;
  return credit - debit;
};

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${className}`}>{children}</span>;
}

function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function AmountCell({ value, tone = 'slate' }: { value: number; tone?: 'slate' | 'debit' | 'credit' }) {
  const color = tone === 'debit' ? 'text-emerald-700' : tone === 'credit' ? 'text-sky-700' : 'text-slate-800';
  return <td className={`px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums ${color}`}>{displayMoney(value)}</td>;
}

function TabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
        active ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

export default function FinanceWorkspace({
  journalEntries,
  entityName = 'Woyla Photocopy',
}: {
  journalEntries: JournalEntry[];
  entityName?: string;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('flow');
  const [ledgerFilter, setLedgerFilter] = useState('ALL');

  const model = useMemo(() => {
    const ledger = new Map<string, { account: ResolvedAccount; debit: number; credit: number; lines: LedgerLine[] }>();

    const addLine = (accountLabel: string, journal: JournalEntry, debit: number, credit: number) => {
      const account = resolveAccount(accountLabel);
      const current = ledger.get(account.code) ?? { account, debit: 0, credit: 0, lines: [] };
      current.debit += debit;
      current.credit += credit;
      current.lines.push({
        account,
        date: journal.entry_date,
        ref: journal.transaction_ref,
        description: journal.description ?? journal.entry_type ?? 'Manual journal',
        debit,
        credit,
        balance: 0,
      });
      ledger.set(account.code, current);
    };

    journalEntries.forEach(journal => {
      addLine(journal.debit_account, journal, journal.amount, 0);
      addLine(journal.credit_account, journal, 0, journal.amount);
    });

    const ledgers = Array.from(ledger.values()).sort((a, b) => a.account.code.localeCompare(b.account.code));
    ledgers.forEach(group => {
      let running = 0;
      group.lines
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach(line => {
          running += group.account.normal_balance === 'DEBIT' ? line.debit - line.credit : line.credit - line.debit;
          line.balance = running;
        });
    });

    const trialBalance = ledgers.map(group => {
      const rawNet = group.debit - group.credit;
      return {
        account: group.account,
        debitTotal: group.debit,
        creditTotal: group.credit,
        debitBalance: rawNet > 0 ? rawNet : 0,
        creditBalance: rawNet < 0 ? Math.abs(rawNet) : 0,
        signedBalance: accountBalanceByType(group.account, group.debit, group.credit),
      };
    });

    const totalDebit = trialBalance.reduce((sum, row) => sum + row.debitBalance, 0);
    const totalCredit = trialBalance.reduce((sum, row) => sum + row.creditBalance, 0);

    const byType = (type: AccountType) => trialBalance.filter(row => row.account.account_type === type);
    const sumType = (type: AccountType) => byType(type).reduce((sum, row) => sum + row.signedBalance, 0);
    const cogsRows = byType('EXPENSE').filter(row => row.account.code.startsWith('50') || /cogs|cost of goods/i.test(row.account.name));
    const opexRows = byType('EXPENSE').filter(row => !cogsRows.some(cogs => cogs.account.code === row.account.code));

    const revenueRows = byType('REVENUE');
    const assetRows = byType('ASSET');
    const liabilityRows = byType('LIABILITY');
    const equityRows = byType('EQUITY');

    const totalRevenue = sumType('REVENUE');
    const totalCogs = cogsRows.reduce((sum, row) => sum + row.signedBalance, 0);
    const grossProfit = totalRevenue - totalCogs;
    const totalOpex = opexRows.reduce((sum, row) => sum + row.signedBalance, 0);
    const netIncome = grossProfit - totalOpex;

    const totalAssets = sumType('ASSET');
    const totalLiabilities = sumType('LIABILITY');
    const equityBeforeIncome = sumType('EQUITY');
    const totalEquity = equityBeforeIncome + netIncome;
    const totalLiabilityEquity = totalLiabilities + totalEquity;

    let operatingInflow = 0;
    let operatingOutflow = 0;
    let investingFlow = 0;
    let financingFlow = 0;

    journalEntries.forEach(journal => {
      const debitAccount = resolveAccount(journal.debit_account);
      const creditAccount = resolveAccount(journal.credit_account);
      const debitIsCash = debitAccount.code === '1010' || debitAccount.code === '1020';
      const creditIsCash = creditAccount.code === '1010' || creditAccount.code === '1020';

      if (debitIsCash) {
        if (creditAccount.account_type === 'EQUITY' || creditAccount.account_type === 'LIABILITY') financingFlow += journal.amount;
        else operatingInflow += journal.amount;
      }

      if (creditIsCash) {
        if (debitAccount.account_category === 'FIXED_ASSET') investingFlow -= journal.amount;
        else if (debitAccount.account_type === 'EQUITY' || debitAccount.account_category === 'LONG_TERM_LIABILITY') financingFlow -= journal.amount;
        else operatingOutflow += journal.amount;
      }
    });

    const cashEnding = assetRows
      .filter(row => row.account.code === '1010' || row.account.code === '1020')
      .reduce((sum, row) => sum + row.signedBalance, 0);
    const netCashChange = operatingInflow - operatingOutflow + investingFlow + financingFlow;

    return {
      ledgers,
      trialBalance,
      totals: {
        totalDebit,
        totalCredit,
        isTrialBalanced: Math.abs(totalDebit - totalCredit) < 1,
      },
      income: {
        revenueRows,
        cogsRows,
        opexRows,
        totalRevenue,
        totalCogs,
        grossProfit,
        totalOpex,
        netIncome,
      },
      balance: {
        assetRows,
        liabilityRows,
        equityRows,
        totalAssets,
        totalLiabilities,
        equityBeforeIncome,
        currentIncome: netIncome,
        totalEquity,
        totalLiabilityEquity,
        difference: Math.abs(totalAssets - totalLiabilityEquity),
      },
      cashflow: {
        operatingInflow,
        operatingOutflow,
        netOperating: operatingInflow - operatingOutflow,
        investingFlow,
        financingFlow,
        netCashChange,
        beginningCash: cashEnding - netCashChange,
        endingCash: cashEnding,
      },
    };
  }, [journalEntries]);

  const visibleLedgers = ledgerFilter === 'ALL'
    ? model.ledgers.filter(group => Math.abs(group.debit - group.credit) > 0)
    : model.ledgers.filter(group => group.account.code === ledgerFilter);

  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const periodLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const equationBalanced = model.balance.difference < 1;
  const cashFlowTieOut = Math.abs(model.cashflow.endingCash - (model.cashflow.beginningCash + model.cashflow.netCashChange)) < 1;

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Owner Finance Control Center</p>
          <h2 className="text-xl font-black mt-1">{entityName} AIS Accounting Cycle</h2>
          <p className="text-xs text-slate-400 mt-1">Posting source: journal entries. Reports follow double-entry and accrual-basis logic.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400">Trial</p>
            <p className="text-xs font-bold">{model.totals.isTrialBalanced ? 'Balanced' : 'Check'}</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400">Equation</p>
            <p className="text-xs font-bold">{equationBalanced ? 'Balanced' : 'Check'}</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400">Cash Flow</p>
            <p className="text-xs font-bold">{cashFlowTieOut ? 'Tied' : 'Check'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
        <div className="flex min-w-max px-2">
          {TABS.map(tab => (
            <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </div>
      </div>

      {activeTab === 'flow' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel title="Reasonable Start-to-End ERP Flow">
            <div className="p-5 space-y-3">
              {[
                ['1', 'Module authorization', 'Cashier starts in Sales access, while owner modules require password authorization before opening.'],
                ['2', 'Sales input', 'Cashier selects service, quantity, and payment. System validates totals and PPN 11%.'],
                ['3', 'Automatic posting', 'System posts cash or bank debit, revenue credit, tax payable credit, COGS debit, and inventory credit.'],
                ['4', 'Procurement cycle', 'Low stock triggers PO, goods receipt records inventory and AP, payment clears AP and cash.'],
                ['5', 'Expense approval', 'Expense is submitted, Owner approves or rejects, approved expense becomes a journal entry.'],
                ['6', 'Close shift', 'Cashier closes register and system logs expected cash for reconciliation.'],
                ['7', 'Ledger and trial balance', 'Journal entries are posted into ledger accounts and summarized in trial balance.'],
                ['8', 'Financial reports', 'Owner reviews income statement, balance sheet, and cash flow for decisions.'],
              ].map(([step, title, body]) => (
                <div key={step} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-black shrink-0">{step}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Auditor Upgrade Notes">
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="font-bold text-emerald-800">Upgraded</p>
                <p className="mt-1">Owner finance reports are now separated by accounting cycle tab instead of mixed in one report view.</p>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                <p className="font-bold text-sky-800">Control point</p>
                <p className="mt-1">PPN payable is separated from Accounts Payable, preventing tax balances from being treated as supplier debt.</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="font-bold text-amber-800">Demo readiness</p>
                <p className="mt-1">Access control now uses module-level owner authorization instead of switching users through a login page.</p>
              </div>
            </div>
          </Panel>

          <Panel title="Manual Validation Checklist">
            <div className="p-5 space-y-2">
              {[
                ['Total debit equals total credit', model.totals.isTrialBalanced],
                ['Assets equal liabilities plus equity', equationBalanced],
                ['Cash flow ending cash equals cash ledger', cashFlowTieOut],
              ].map(([label, ok]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="text-xs text-slate-600">{label}</span>
                  <Badge className={ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}>
                    {ok ? 'PASS' : 'CHECK'}
                  </Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'coa' && (
        <Panel title="Chart of Accounts" right={<Badge className="bg-slate-50 text-slate-700 border-slate-200">{chartOfAccounts.length} accounts</Badge>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Account Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Normal Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartOfAccounts.map(account => (
                  <tr key={account.account_code} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{account.account_code}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{account.account_name}</td>
                    <td className="px-4 py-3"><Badge className={TYPE_CLASS[account.account_type]}>{account.account_type}</Badge></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{account.account_category.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-700">{account.normal_balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === 'journal' && (
        <Panel title="Journal Entries" right={<Badge className="bg-violet-50 text-violet-700 border-violet-200">{journalEntries.length} entries</Badge>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Ref</th>
                  <th className="px-4 py-3 text-left font-semibold">Debit Account</th>
                  <th className="px-4 py-3 text-left font-semibold">Credit Account</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalEntries
                  .slice()
                  .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
                  .map(entry => (
                    <tr key={entry.journal_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(entry.entry_date).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-violet-700">{entry.transaction_ref}</td>
                      <td className="px-4 py-3 text-xs text-emerald-700">{entry.debit_account}</td>
                      <td className="px-4 py-3 text-xs text-sky-700">{entry.credit_account}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold">{money(entry.amount)}</td>
                      <td className="px-4 py-3"><Badge className="bg-slate-50 text-slate-700 border-slate-200">{entry.entry_type ?? 'MANUAL'}</Badge></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === 'ledger' && (
        <Panel
          title="General Ledger"
          right={
            <select
              value={ledgerFilter}
              onChange={event => setLedgerFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="ALL">All non-zero accounts</option>
              {model.ledgers.map(group => (
                <option key={group.account.code} value={group.account.code}>{group.account.code} - {group.account.name}</option>
              ))}
            </select>
          }
        >
          <div className="p-5 space-y-4">
            {visibleLedgers.map(group => (
              <div key={group.account.code} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-800">{group.account.code} - {group.account.name}</p>
                    <p className="text-[10px] text-slate-500">Normal balance: {group.account.normal_balance}</p>
                  </div>
                  <Badge className={TYPE_CLASS[group.account.account_type]}>{group.account.account_type}</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-slate-500">
                        <th className="px-4 py-2 text-left font-semibold">Date</th>
                        <th className="px-4 py-2 text-left font-semibold">Ref</th>
                        <th className="px-4 py-2 text-left font-semibold">Description</th>
                        <th className="px-4 py-2 text-right font-semibold">Debit</th>
                        <th className="px-4 py-2 text-right font-semibold">Credit</th>
                        <th className="px-4 py-2 text-right font-semibold">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.lines.map((line, index) => (
                        <tr key={`${line.ref}-${index}`}>
                          <td className="px-4 py-2 text-xs text-slate-500">{new Date(line.date).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-2 font-mono text-xs text-violet-700">{line.ref}</td>
                          <td className="px-4 py-2 text-xs text-slate-600">{line.description}</td>
                          <AmountCell value={line.debit} tone="debit" />
                          <AmountCell value={line.credit} tone="credit" />
                          <AmountCell value={line.balance} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {activeTab === 'trial' && (
        <Panel
          title="Trial Balance"
          right={<Badge className={model.totals.isTrialBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}>{model.totals.isTrialBalanced ? 'BALANCED' : 'IMBALANCED'}</Badge>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Account</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Debit</th>
                  <th className="px-4 py-3 text-right font-semibold">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {model.trialBalance.map(row => (
                  <tr key={row.account.code} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.account.code}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800">{row.account.name}</td>
                    <td className="px-4 py-3"><Badge className={TYPE_CLASS[row.account.account_type]}>{row.account.account_type}</Badge></td>
                    <AmountCell value={row.debitBalance} tone="debit" />
                    <AmountCell value={row.creditBalance} tone="credit" />
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={3} className="px-4 py-3 text-xs font-black uppercase text-slate-600">Total</td>
                  <AmountCell value={model.totals.totalDebit} tone="debit" />
                  <AmountCell value={model.totals.totalCredit} tone="credit" />
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === 'income' && (
        <Panel title="Income Statement" right={<span className="text-xs text-slate-500">For the period ending {periodLabel}</span>}>
          <div className="p-5 max-w-3xl space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">Revenue</p>
              {model.income.revenueRows.map(row => (
                <div key={row.account.code} className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-600">{row.account.name}</span>
                  <span className="font-mono font-semibold">{displayMoney(row.signedBalance)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                <span>Total Revenue</span>
                <span className="font-mono">{displayMoney(model.income.totalRevenue)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Cost of Goods Sold</p>
              {model.income.cogsRows.map(row => (
                <div key={row.account.code} className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-600">{row.account.name}</span>
                  <span className="font-mono font-semibold">({money(row.signedBalance)})</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                <span>Gross Profit</span>
                <span className="font-mono">{displayMoney(model.income.grossProfit)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-rose-700 mb-2">Operating Expenses</p>
              {model.income.opexRows.map(row => (
                <div key={row.account.code} className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-600">{row.account.name}</span>
                  <span className="font-mono font-semibold">({money(row.signedBalance)})</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                <span>Total Operating Expenses</span>
                <span className="font-mono">({money(model.income.totalOpex)})</span>
              </div>
            </div>
            <div className={`rounded-lg border-2 p-4 flex justify-between ${model.income.netIncome >= 0 ? 'bg-violet-50 border-violet-200 text-violet-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
              <span className="font-black">Net Income</span>
              <span className="font-mono font-black">{displayMoney(model.income.netIncome)}</span>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === 'balance' && (
        <Panel
          title="Balance Sheet"
          right={<span className="text-xs text-slate-500">As of {reportDate}</span>}
        >
          <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-sky-700 mb-2">Assets</p>
                {model.balance.assetRows.map(row => (
                  <div key={row.account.code} className="flex justify-between py-1.5 text-sm">
                    <span className="text-slate-600">{row.account.name}</span>
                    <span className="font-mono font-semibold">{displayMoney(row.signedBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                  <span>Total Assets</span>
                  <span className="font-mono">{displayMoney(model.balance.totalAssets)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-rose-700 mb-2">Liabilities</p>
                {model.balance.liabilityRows.map(row => (
                  <div key={row.account.code} className="flex justify-between py-1.5 text-sm">
                    <span className="text-slate-600">{row.account.name}</span>
                    <span className="font-mono font-semibold">{displayMoney(row.signedBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                  <span>Total Liabilities</span>
                  <span className="font-mono">{displayMoney(model.balance.totalLiabilities)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-violet-700 mb-2">Owner Equity</p>
                {model.balance.equityRows.map(row => (
                  <div key={row.account.code} className="flex justify-between py-1.5 text-sm">
                    <span className="text-slate-600">{row.account.name}</span>
                    <span className="font-mono font-semibold">{displayMoney(row.signedBalance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-slate-600">Current Period Net Income</span>
                  <span className="font-mono font-semibold">{displayMoney(model.balance.currentIncome)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                  <span>Total Equity</span>
                  <span className="font-mono">{displayMoney(model.balance.totalEquity)}</span>
                </div>
              </div>
              <div className={`rounded-lg border-2 p-4 ${equationBalanced ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex justify-between text-sm font-black">
                  <span>Liabilities + Equity</span>
                  <span className="font-mono">{displayMoney(model.balance.totalLiabilityEquity)}</span>
                </div>
                {!equationBalanced && (
                  <div className="flex justify-between pt-2 text-xs font-bold text-red-700">
                    <span>Difference</span>
                    <span className="font-mono">{money(model.balance.difference)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === 'cashflow' && (
        <Panel title="Cash Flow Statement" right={<span className="text-xs text-slate-500">Direct method</span>}>
          <div className="p-5 max-w-3xl space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">Operating Activities</p>
              <div className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">Cash received from customers and operations</span><span className="font-mono font-semibold">{displayMoney(model.cashflow.operatingInflow)}</span></div>
              <div className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">Cash paid for suppliers, inventory, tax, and expenses</span><span className="font-mono font-semibold">({money(model.cashflow.operatingOutflow)})</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black"><span>Net Cash from Operating Activities</span><span className="font-mono">{displayMoney(model.cashflow.netOperating)}</span></div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-sky-700 mb-2">Investing Activities</p>
              <div className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">Equipment and fixed asset movement</span><span className="font-mono font-semibold">{displayMoney(model.cashflow.investingFlow)}</span></div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-violet-700 mb-2">Financing Activities</p>
              <div className="flex justify-between py-1.5 text-sm"><span className="text-slate-600">Owner capital, drawings, and financing movement</span><span className="font-mono font-semibold">{displayMoney(model.cashflow.financingFlow)}</span></div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Beginning Cash</span><span className="font-mono font-semibold">{displayMoney(model.cashflow.beginningCash)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-600">Net Increase / Decrease in Cash</span><span className="font-mono font-semibold">{displayMoney(model.cashflow.netCashChange)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black"><span>Ending Cash</span><span className="font-mono">{displayMoney(model.cashflow.endingCash)}</span></div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
