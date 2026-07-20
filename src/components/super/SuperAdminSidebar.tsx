import { Users, ClipboardList, ShieldAlert } from 'lucide-react';
import type { SuperAdminTab } from '../../types/superAdmin';

interface SuperAdminSidebarProps {
  activeTab: SuperAdminTab;
  setActiveTab: (t: SuperAdminTab) => void;
  t: (key: string) => string; // <=== Thêm prop t
}

export function SuperAdminSidebar({ activeTab, setActiveTab, t }: SuperAdminSidebarProps) {
  const items = [
    { id: 'accounts' as SuperAdminTab, label: t('adminAccounts') || 'Admin Accounts', icon: <Users size={18} /> },
    { id: 'audit' as SuperAdminTab, label: t('systemAuditLog') || 'System Audit Log', icon: <ClipboardList size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r hidden md:block" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-red-600">
            <ShieldAlert size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--ct-text)]">{t('superAdminRole') || 'Super Admin'}</p>
            <p className="text-xs opacity-60 text-[var(--ct-text)]">{t('platformOwner') || 'Platform Owner'}</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {items.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'text-white bg-black' : 'text-[var(--ct-text)] opacity-60 hover:opacity-100'}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}