import { LayoutDashboard, Upload, ClipboardCheck, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { IssuerTab } from '../../types/issuer';
import type { UserProfile } from '@/api/types/auth.types';

interface SidebarProps {
  activeTab: IssuerTab;
  setActiveTab: (tab: IssuerTab) => void;
  pendingCount: number;
  t: (key: string) => string;
  userProfile?: UserProfile | null;
}

function BuildingIcon({ size }: { size: number }) {
  return <BarChart3 size={size} />;
}

export function IssuerSidebarDesktop({ activeTab, setActiveTab, t, userProfile }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as IssuerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'upload' as IssuerTab, label: t('uploadCSV'), icon: <Upload size={18} /> },
    { id: 'credentials' as IssuerTab, label: t('credentialListTitle'), icon: <ClipboardCheck size={18} /> },
    { id: 'analytics' as IssuerTab, label: t('analytics'), icon: <BarChart3 size={18} /> },
  ];

  // Xử lý dữ liệu hiển thị từ userProfile
  const displayName = userProfile?.organization_name || userProfile?.full_name || 'Issuer';
  const displaySub = userProfile?.email || userProfile?.actor_id || 'Loading...';

  return (
    <aside className="w-64 flex-shrink-0 border-r hidden md:flex md:flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center gap-3">
          <div className="portal-avatar w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold">
            <BuildingIcon size={16} />
          </div>
          <div className="overflow-hidden"> {/* Thêm overflow-hidden để chống vỡ layout khi text quá dài */}
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs opacity-60 truncate">{displaySub}</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {sidebarItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`portal-navitem w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium ${activeTab === item.id ? 'is-active' : ''}`}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t" style={{ borderColor: 'var(--ct-border)' }}>
        <Button asChild variant="outline" size="sm" className="portal-backlink w-full justify-center">
          <Link to="/">
            <ArrowLeft size={14} />
            {t('backToLanding')}
          </Link>
        </Button>
      </div>
    </aside>
  );
}

export function IssuerSidebarMobile({ activeTab, setActiveTab, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as IssuerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'upload' as IssuerTab, label: t('uploadCSV'), icon: <Upload size={18} /> },
    { id: 'credentials' as IssuerTab, label: t('credentialListTitle'), icon: <ClipboardCheck size={18} /> },
    { id: 'analytics' as IssuerTab, label: t('analytics'), icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
      {sidebarItems.map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`portal-navitem portal-navitem--chip flex-shrink-0 px-3 py-2 text-xs font-medium ${activeTab === item.id ? 'is-active' : ''}`}>
          {item.icon}
        </button>
      ))}
    </div>
  );
}