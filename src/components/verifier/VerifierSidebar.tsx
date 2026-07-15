import { LayoutDashboard, Search, History, BarChart3, Building2 } from 'lucide-react';
import { currentVerifier } from '../../data/mockData';
import type { VerifierTab } from '../../types/verifier';

interface SidebarProps {
  activeTab: VerifierTab;
  setActiveTab: (tab: VerifierTab) => void;
  quotaUsed: number;
  t: (key: string) => string;
}

export function VerifierSidebarDesktop({ activeTab, setActiveTab, quotaUsed, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as VerifierTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'verify' as VerifierTab, label: t('verifyCredential'), icon: <Search size={18} /> },
    { id: 'history' as VerifierTab, label: t('verifyHistory'), icon: <History size={18} /> },
    { id: 'quota' as VerifierTab, label: t('quotaPlan'), icon: <BarChart3 size={18} /> },
    { id: 'register' as VerifierTab, label: t('orgRegistration'), icon: <Building2 size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#000' }}>
            {currentVerifier.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">{currentVerifier.name}</p>
            <p className="text-xs opacity-60">{currentVerifier.company}</p>
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
      {/* Quota mini */}
      <div className="p-4 mt-auto border-t" style={{ borderColor: 'var(--ct-border)' }}>
        <p className="text-xs font-medium mb-2">{t('freeTier')}</p>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ct-border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(quotaUsed / 20) * 100}%`, background: quotaUsed >= 20 ? '#ef4444' : '#000' }} />
        </div>
        <p className="text-xs mt-1 opacity-60">{quotaUsed}/20 {t('used')}</p>
      </div>
    </aside>
  );
}

export function VerifierSidebarMobile({ activeTab, setActiveTab, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as VerifierTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'verify' as VerifierTab, label: t('verifyCredential'), icon: <Search size={18} /> },
    { id: 'history' as VerifierTab, label: t('verifyHistory'), icon: <History size={18} /> },
    { id: 'quota' as VerifierTab, label: t('quotaPlan'), icon: <BarChart3 size={18} /> },
    { id: 'register' as VerifierTab, label: t('orgRegistration'), icon: <Building2 size={18} /> },
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