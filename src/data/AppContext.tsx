import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import { users } from './users';
import { User } from './index';
import CashierDashboard from './CashierDashboard';
import OwnerDashboard from './OwnerDashboard';
import AuditorDashboard from './AuditorDashboard';

/* ─── Login Page ─── */
function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const found = users.find(
        u => u.username.toLowerCase() === username.toLowerCase() &&
          u.password === password && u.account_status === 'ACTIVE'
      );
      if (found) onLogin(found);
      else setError('Incorrect username or password.');
      setLoading(false);
    }, 400);
  };

  const DEMO = [
    { label: 'Cashier', u: 'Cashier', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Owner', u: 'Owner', color: 'text-violet-600 bg-violet-50 border-violet-200' },
    { label: 'Auditor', u: 'Auditor', color: 'text-sky-600 bg-sky-50 border-sky-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-4 shadow-lg shadow-violet-900/40">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Woyla Photocopy</h1>

        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all" required />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/50 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-violet-900/30">
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-slate-800">
            
            <div className="flex gap-2">
              {DEMO.map(acc => (
                <button key={acc.u} onClick={() => { setUsername(acc.u); setPassword('1234'); setError(''); }}
                  className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all hover:opacity-80 ${acc.color}`}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sidebar & Layout ─── */
const NAV_ITEMS: Record<string, { icon: React.ReactNode; label: string; id: string }[]> = {
  CASHIER: [{
    id: 'pos', label: 'Cashier Terminal',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  }, {
    id: 'shift', label: 'Close Shift',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  }],
  OWNER: [{
    id: 'dashboard', label: 'KPI Dashboard',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  }, {
    id: 'procurement', label: 'Procurement',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  }],
  AUDITOR: [{
    id: 'dashboard', label: 'Audit Dashboard',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  }],
};

const ROLE_META: Record<string, { badge: string; badgeClass: string; accent: string }> = {
  CASHIER: { badge: 'Cashier', badgeClass: 'bg-emerald-900/60 text-emerald-300 border border-emerald-800', accent: 'bg-emerald-500' },
  OWNER: { badge: 'Owner', badgeClass: 'bg-violet-900/60 text-violet-300 border border-violet-800', accent: 'bg-violet-500' },
  AUDITOR: { badge: 'Auditor', badgeClass: 'bg-sky-900/60 text-sky-300 border border-sky-800', accent: 'bg-sky-500' },
};

function AppLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState(NAV_ITEMS[user.role]?.[0]?.id || '');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const meta = ROLE_META[user.role] || ROLE_META.CASHIER;
  const navItems = NAV_ITEMS[user.role] || [];

  const renderDashboard = () => {
    if (user.role === 'CASHIER') return <CashierDashboard user={user} activeTab={activeNav} onNavigate={setActiveNav} />;
    if (user.role === 'OWNER') return <OwnerDashboard user={user} activeTab={activeNav} />;
    if (user.role === 'AUDITOR') return <AuditorDashboard user={user} activeTab={activeNav} />;
    return null;
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} shrink-0 bg-slate-950 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold leading-tight truncate">Woyla Photocopy</p>
              <p className="text-slate-500 text-xs truncate">AIS Enterprise</p>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeNav === item.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}>
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className={`w-8 h-8 rounded-full ${meta.accent} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {user.full_name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{user.full_name}</p>
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md font-medium mt-0.5 ${meta.badgeClass}`}>{meta.badge}</span>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={onLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
          <h1 className="text-sm font-semibold text-slate-800">{navItems.find(n => n.id === activeNav)?.label || 'Dashboard'}</h1>
          <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">Woyla Photocopy · Online</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${meta.badgeClass}`}>{meta.badge}</span>
              <button onClick={onLogout} className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1.5">

              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout

            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

/* ─── Root ─── */
export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;
  return (
    <AppProvider>
      <AppLayout user={currentUser} onLogout={() => setCurrentUser(null)} />
    </AppProvider>
  );
}