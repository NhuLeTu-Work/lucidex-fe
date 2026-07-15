import { FileText, Link2, ClipboardList, Award, Plus, Settings, ChevronRight } from 'lucide-react';
import { mockCredentials, mockAuditLog, currentOwner } from '../../data/mockData';
import type { OwnerTab, VerifiedLink } from '../../types/owner';

interface OwnerDashboardProps {
  t: (k: string) => string;
  links: VerifiedLink[];
  onTabChange: (t: OwnerTab) => void;
}

export function OwnerDashboard({ t, links, onTabChange }: OwnerDashboardProps) {
  const activeLinks = links.filter(l => l.status === 'active').length;
  const credCount = mockCredentials.filter(c => c.studentId === currentOwner.studentId).length;

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('welcomeOwner')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('mockDataLabel')} — {t('phase1Label')}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('myCredentials')} value={credCount.toString()} icon={<FileText size={20} />} onClick={() => onTabChange('credentials')} />
        <StatCard label={t('verifiedLinks')} value={activeLinks.toString()} icon={<Link2 size={20} />} onClick={() => onTabChange('links')} />
        <StatCard label={t('auditLog')} value={mockAuditLog.length.toString()} icon={<ClipboardList size={20} />} onClick={() => onTabChange('audit')} />
        <StatCard label={t('claimDegree')} value="+" icon={<Award size={20} />} onClick={() => onTabChange('claim')} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('createVerifiedLink')}</h3>
          <button onClick={() => onTabChange('links')} className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <Plus size={16} className="inline mr-2" />
            {t('createVerifiedLink')}
          </button>
        </div>
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('consentSettings')}</h3>
          <button onClick={() => onTabChange('consent')} className="w-full py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-text)', color: 'var(--ct-text)' }}>
            <Settings size={16} className="inline mr-2" />
            {t('consentSettings')}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, onClick }: { label: string; value: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] group" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: 'var(--ct-text-secondary)' }}>{icon}</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--ct-text-secondary)' }} />
      </div>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--ct-text-secondary)' }}>{label}</p>
    </button>
  );
}