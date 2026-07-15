import { LayoutDashboard, Upload, ClipboardCheck, BarChart3 } from 'lucide-react';
import { currentIssuer } from '../../data/mockData';
import type { IssuerTab } from '../../types/issuer';

interface SidebarProps {
  activeTab: IssuerTab;
  setActiveTab: (tab: IssuerTab) => void;
  pendingCount: number;
  t: (key: string) => string;
}

function BuildingIcon({ size }: { size: number }) {
  return <BarChart3 size={size} />;
}

export function IssuerSidebarDesktop({ activeTab, setActiveTab, pendingCount, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as IssuerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'upload' as IssuerTab, label: t('uploadCSV'), icon: <Upload size={18} /> },
    { id: 'review' as IssuerTab, label: t('manualReview'), icon: <ClipboardCheck size={18} /> },
    { id: 'analytics' as IssuerTab, label: t('analytics'), icon: <BarChart3 size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#000' }}>
            <BuildingIcon size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold">{currentIssuer.name}</p>
            <p className="text-xs opacity-60">CICT - CTU</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'text-white' : 'opacity-60 hover:opacity-100'}`} style={{ background: activeTab === item.id ? '#000' : 'transparent' }}>
            {item.icon}
            {item.label}
            {item.id === 'review' && pendingCount > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function IssuerSidebarMobile({ activeTab, setActiveTab, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as IssuerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'upload' as IssuerTab, label: t('uploadCSV'), icon: <Upload size={18} /> },
    { id: 'review' as IssuerTab, label: t('manualReview'), icon: <ClipboardCheck size={18} /> },
    { id: 'analytics' as IssuerTab, label: t('analytics'), icon: <BarChart3 size={18} /> },
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