import { LayoutDashboard, Inbox, Users, ShieldCheck } from 'lucide-react';
import type { AdminTab } from '../../types/admin';

export function AdminSidebarDesktop({ activeTab, setActiveTab, pendingCount, currentAdmin, t }: any) {
  const sidebarItems = [
    { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'requests', label: t('pendingRequests') || 'Pending Requests', icon: <Inbox size={18} /> },
    { id: 'accounts', label: t('accounts') || 'Accounts', icon: <Users size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r hidden md:block border-[var(--ct-border)] bg-[var(--ct-surface)]">
      <div className="p-6 border-b border-[var(--ct-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-black">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ct-text)]">{currentAdmin.name}</p>
            <p className="text-xs opacity-60 text-[var(--ct-text)]">System Administrator</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id as AdminTab)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'text-white bg-black' : 'opacity-60 hover:opacity-100 text-[var(--ct-text)] bg-transparent'}`}>
            {item.icon}
            {item.label}
            {item.id === 'requests' && pendingCount > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function AdminSidebarMobile({ activeTab, setActiveTab, t }: any) {
  const sidebarItems = [
    { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'requests', label: t('pendingRequests') || 'Pending Requests', icon: <Inbox size={18} /> },
    { id: 'accounts', label: t('accounts') || 'Accounts', icon: <Users size={18} /> },
  ];

  return (
    <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
      {sidebarItems.map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id as AdminTab)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === item.id ? 'text-white bg-black' : 'opacity-60 text-[var(--ct-text)] bg-[var(--ct-surface)]'}`}>
          {item.icon}
        </button>
      ))}
    </div>
  );
}