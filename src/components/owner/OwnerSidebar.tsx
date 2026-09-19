import { LayoutDashboard, FileText, QrCode, ClipboardList, Settings, Award, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { OwnerTab } from '../../types/owner';
import type { UserProfile } from '@/api/types/auth.types'; // Đảm bảo import đúng đường dẫn type

interface SidebarProps {
  activeTab: OwnerTab;
  setActiveTab: (tab: OwnerTab) => void;
  t: (key: string) => string;
  userProfile?: UserProfile | null; // Thêm prop này
}

export function OwnerSidebarDesktop({ activeTab, setActiveTab, t, userProfile }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as OwnerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'credentials' as OwnerTab, label: t('myCredentials'), icon: <FileText size={18} /> },
    { id: 'links' as OwnerTab, label: t('verifiedLinks'), icon: <QrCode size={18} /> },
    { id: 'audit' as OwnerTab, label: t('auditLog'), icon: <ClipboardList size={18} /> },
    { id: 'consent' as OwnerTab, label: t('consentSettings'), icon: <Settings size={18} /> },
    { id: 'ekyc' as OwnerTab, label: t('ekycNav'), icon: <Award size={18} /> }
  ];

  // Xử lý dữ liệu fallback nếu userProfile chưa load xong
  const displayName = userProfile?.full_name || userProfile?.username || 'Owner';
  const displayId = userProfile?.email || userProfile?.actor_id || 'Loading...';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 flex-shrink-0 border-r hidden md:flex md:flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center gap-3">
          <div className="portal-avatar w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {avatarInitial}
          </div>
          <div className="overflow-hidden"> {/* Thêm overflow-hidden để tránh text dài làm vỡ layout */}
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs font-mono opacity-60 truncate">{displayId}</p>
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

export function OwnerSidebarMobile({ activeTab, setActiveTab, t }: SidebarProps) {
  const sidebarItems = [
    { id: 'dashboard' as OwnerTab, label: t('dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: 'credentials' as OwnerTab, label: t('myCredentials'), icon: <FileText size={18} /> },
    { id: 'links' as OwnerTab, label: t('verifiedLinks'), icon: <QrCode size={18} /> },
    { id: 'audit' as OwnerTab, label: t('auditLog'), icon: <ClipboardList size={18} /> },
    { id: 'consent' as OwnerTab, label: t('consentSettings'), icon: <Settings size={18} /> },
    { id: 'ekyc' as OwnerTab, label: t('ekycNav'), icon: <Award size={18} /> }
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