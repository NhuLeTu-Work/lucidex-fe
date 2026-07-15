import { LayoutDashboard, FileText, Link2, ClipboardList, Settings, Award } from 'lucide-react';
import { currentOwner } from '../../data/mockData';
import type { OwnerTab } from '../../types/owner';

interface SidebarProps {
  activeTab: OwnerTab;
  setActiveTab: (tab: OwnerTab) => void;
  t: (key: string) => string;
}

export function OwnerSidebarDesktop({ activeTab, setActiveTab, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as OwnerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'credentials' as OwnerTab, label: t('myCredentials'), icon: <FileText size={18} /> },
    { id: 'links' as OwnerTab, label: t('verifiedLinks'), icon: <Link2 size={18} /> },
    { id: 'audit' as OwnerTab, label: t('auditLog'), icon: <ClipboardList size={18} /> },
    { id: 'consent' as OwnerTab, label: t('consentSettings'), icon: <Settings size={18} /> },
    { id: 'claim' as OwnerTab, label: t('claimDegree'), icon: <Award size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#000' }}>
            {currentOwner.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">{currentOwner.name}</p>
            <p className="text-xs font-mono opacity-60">{currentOwner.studentId}</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60 hover:opacity-100'}`} style={{ background: activeTab === item.id ? '#000' : 'transparent' }}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function OwnerSidebarMobile({ activeTab, setActiveTab, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as OwnerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'credentials' as OwnerTab, label: t('myCredentials'), icon: <FileText size={18} /> },
    { id: 'links' as OwnerTab, label: t('verifiedLinks'), icon: <Link2 size={18} /> },
    { id: 'audit' as OwnerTab, label: t('auditLog'), icon: <ClipboardList size={18} /> },
    { id: 'consent' as OwnerTab, label: t('consentSettings'), icon: <Settings size={18} /> },
    { id: 'claim' as OwnerTab, label: t('claimDegree'), icon: <Award size={18} /> },
  ];

  return (
    <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
      {sidebarItems.map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60'}`} style={{ background: activeTab === item.id ? '#000' : 'var(--ct-surface)' }}>
          {item.icon}
        </button>
      ))}
    </div>
  );
}