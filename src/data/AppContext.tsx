import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AppProvider, useAppContext } from '../context/AppContext';
import { users } from './users';
import type { User } from './index';
import CashierDashboard from './CashierDashboard';
import OwnerDashboard from './OwnerDashboard';

type NavId = 'pos' | 'dashboard' | 'procurement' | 'financials';
type AccessLevel = 'CASHIER' | 'OWNER';

type ModuleNavItem = {
  id: NavId;
  label: string;
  module: string;
  access: AccessLevel;
  icon: ReactNode;
};

const CASHIER_META = {
  badge: 'Cashier Mode',
  badgeClass: 'bg-emerald-900/60 text-emerald-300 border border-emerald-800',
  accent: 'bg-emerald-500',
};

const OWNER_META = {
  badge: 'Owner Authorized',
  badgeClass: 'bg-violet-900/60 text-violet-300 border border-violet-800',
  accent: 'bg-violet-500',
};

const LockIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m-.75 0h10.5A1.75 1.75 0 0119 12.25v6A1.75 1.75 0 0117.25 20H6.75A1.75 1.75 0 015 18.25v-6a1.75 1.75 0 011.75-1.75z"
    />
  </svg>
);

const NAV_ITEMS: ModuleNavItem[] = [
  {
    id: 'pos',
    label: 'Cashier Terminal',
    module: 'Sales',
    access: 'CASHIER',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Executive Dashboard',
    module: 'Management Accounting',
    access: 'OWNER',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'procurement',
    label: 'Procurement Management',
    module: 'Procurement',
    access: 'OWNER',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: 'financials',
    label: 'Financial Reports',
    module: 'Financial Accounting',
    access: 'OWNER',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function OwnerAuthorizationModal({
  item,
  ownerUser,
  onCancel,
  onAuthorize,
}: {
  item: ModuleNavItem;
  ownerUser: User;
  onCancel: () => void;
  onAuthorize: () => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === ownerUser.password || password === ownerUser.pin) {
      setError('');
      onAuthorize();
      return;
    }

    setError('Password owner tidak sesuai.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <LockIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">Owner Authorization</h2>
              <p className="truncate text-xs text-slate-500">{item.module} / {item.label}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Owner Password</label>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              placeholder="Masukkan password owner"
            />
            <p className="mt-1.5 text-[10px] font-semibold text-slate-400">Demo password: 1234</p>
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onCancel} className="flex-1 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
              Authorize Owner Session
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function AppLayout({ cashierUser, ownerUser }: { cashierUser: User; ownerUser: User }) {
  const { pushAudit, setRole } = useAppContext();
  const [activeNav, setActiveNav] = useState<NavId>('pos');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingNav, setPendingNav] = useState<ModuleNavItem | null>(null);
  const [ownerAuthorized, setOwnerAuthorized] = useState(false);

  const activeItem = NAV_ITEMS.find((item) => item.id === activeNav) ?? NAV_ITEMS[0];
  const sessionUser = ownerAuthorized ? ownerUser : cashierUser;
  const sessionMeta = ownerAuthorized ? OWNER_META : CASHIER_META;

  const handleNavSelect = (item: ModuleNavItem) => {
    if (item.access === 'OWNER' && !ownerAuthorized) {
      setPendingNav(item);
      return;
    }

    setActiveNav(item.id);
  };

  const authorizePendingModule = () => {
    if (!pendingNav) return;

    setOwnerAuthorized(true);
    setRole('OWNER');
    setActiveNav(pendingNav.id);
    pushAudit({
      userId: ownerUser.user_id,
      action: 'VIEW_REPORT',
      module: pendingNav.module,
      targetId: pendingNav.id,
      details: `Owner session authorized from ${cashierUser.full_name}; owner profile is now active.`,
    });
    setPendingNav(null);
  };

  const resetOwnerAccess = () => {
    setOwnerAuthorized(false);
    setRole('CASHIER');
    if (activeItem.access === 'OWNER') setActiveNav('pos');
  };

  const renderDashboard = () => {
    if (activeItem.access === 'OWNER') return <OwnerDashboard user={ownerUser} activeTab={activeNav} />;
    return <CashierDashboard user={cashierUser} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} flex shrink-0 flex-col overflow-hidden bg-slate-950 transition-all duration-300`}>
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold leading-tight text-white">Woyla Photocopy</p>
              <p className="truncate text-xs text-slate-500">AIS Enterprise</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            const locked = item.access === 'OWNER' && !ownerAuthorized;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavSelect(item)}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  isActive ? 'bg-slate-800 text-white' : locked ? 'text-slate-500 hover:bg-slate-900 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate font-medium">{item.label}</span>
                      <span className="block truncate text-[10px] uppercase tracking-wider text-slate-500">{item.module}</span>
                    </span>
                    {locked && <LockIcon className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                    {!locked && item.access === 'OWNER' && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${sessionMeta.accent} text-xs font-bold text-white`}>
              {sessionUser.full_name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{sessionUser.full_name}</p>
                <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium ${sessionMeta.badgeClass}`}>{sessionMeta.badge}</span>
              </div>
            )}
          </div>

          {sidebarOpen && ownerAuthorized && (
            <button
              type="button"
              onClick={resetOwnerAccess}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white"
            >
              <LockIcon className="h-3.5 w-3.5" />
              Lock Owner Session
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 transition-colors hover:text-slate-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-semibold text-slate-800">{activeItem.label}</h1>
              <p className="text-xs text-slate-400">{activeItem.module} Module</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">Woyla Photocopy Online</span>
            </div>
            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${sessionMeta.badgeClass}`}>{sessionMeta.badge}</span>
            {ownerAuthorized && (
              <span className="hidden rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 md:inline-flex">
                {ownerUser.full_name}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {renderDashboard()}
        </main>
      </div>

      {pendingNav && (
        <OwnerAuthorizationModal
          item={pendingNav}
          ownerUser={ownerUser}
          onCancel={() => setPendingNav(null)}
          onAuthorize={authorizePendingModule}
        />
      )}
    </div>
  );
}

export default function App() {
  const cashierUser = useMemo(() => users.find((user) => user.role === 'CASHIER' && user.account_status === 'ACTIVE') ?? users[0], []);
  const ownerUser = useMemo(() => users.find((user) => user.role === 'OWNER' && user.account_status === 'ACTIVE') ?? users.find((user) => user.role === 'OWNER') ?? cashierUser, [cashierUser]);

  return (
    <AppProvider initialRole="CASHIER">
      <AppLayout cashierUser={cashierUser} ownerUser={ownerUser} />
    </AppProvider>
  );
}
