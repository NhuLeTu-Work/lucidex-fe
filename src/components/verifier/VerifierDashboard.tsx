import { BarChart3, History, Search, ArrowRight, ChevronRight, CheckCircle } from 'lucide-react';
import { currentVerifier, mockVerifierVerifyHistory } from '../../data/mockData';
import { StatCard } from './StatCard';
import type { VerifierTab } from '../../types/verifier';

interface DashboardProps {
  t: (k: string) => string;
  quotaUsed: number;
  onTabChange: (t: VerifierTab) => void;
}

export function VerifierDashboard({ t, quotaUsed, onTabChange }: DashboardProps) {
  const remaining = 20 - quotaUsed;

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('welcomeVerifier')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{currentVerifier.company} — {t('mockDataLabel')}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label={t('verificationsUsed')} value={`${quotaUsed}/20`} icon={<BarChart3 size={20} />} onClick={() => onTabChange('quota')} />
        <StatCard label={t('verifyHistory')} value={mockVerifierVerifyHistory.length.toString()} icon={<History size={20} />} onClick={() => onTabChange('history')} />
        <StatCard label={t('verifyCredential')} value="+" icon={<Search size={20} />} onClick={() => onTabChange('verify')} />
      </div>

      <div className="p-6 rounded-2xl border mb-8" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('verifyCredential')}</h3>
        <div className="flex gap-3">
          <input type="text" placeholder="abc123" className="flex-1 px-4 py-3 rounded-xl border text-sm font-mono outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
          <button onClick={() => onTabChange('verify')} className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <ArrowRight size={16} />
          </button>
        </div>
        <p className="text-xs mt-2 opacity-50">{remaining} {t('remaining')}</p>
      </div>

      <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('verifyHistory')}</h3>
          <button onClick={() => onTabChange('history')} className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100"><ChevronRight size={12} /></button>
        </div>
        <div className="space-y-2">
          {mockVerifierVerifyHistory.slice(0, 3).map(h => (
            <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--ct-border)' }}>
              <div className="flex items-center gap-3">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-sm">{h.ownerName}</span>
              </div>
              <span className="text-xs font-mono opacity-50">{new Date(h.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}