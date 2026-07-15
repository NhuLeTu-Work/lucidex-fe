import { TrendingUp, Users, Clock, Upload, ChevronRight, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyVerifications, mockOwners, mockReviewQueue } from '../../data/mockData';
import { StatCard } from '../ui/statCard';
import type { IssuerTab } from '../../types/issuer';

interface IssuerDashboardProps {
  t: (k: string) => string;
  pendingCount: number;
  onTabChange: (t: IssuerTab) => void;
}

export function IssuerDashboard({ t, pendingCount, onTabChange }: IssuerDashboardProps) {
  const activeOwners = mockOwners.filter(s => s.activated).length;

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('welcomeIssuer')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('mockDataLabel')} — {t('phase1Label')}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('verificationsThisMonth')} value="58" icon={<TrendingUp size={20} />} onClick={() => onTabChange('analytics')} />
        <StatCard label={t('activeOwners')} value={activeOwners.toString()} icon={<Users size={20} />} onClick={() => {}} />
        <StatCard label={t('pendingReviews')} value={pendingCount.toString()} icon={<Clock size={20} />} onClick={() => onTabChange('review')} />
        <StatCard label={t('uploadCSV')} value="+" icon={<Upload size={20} />} onClick={() => onTabChange('upload')} />
      </div>

      {/* Mini Chart */}
      <div className="p-6 rounded-2xl border mb-8" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('verifyTrends')}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyVerifications}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#000" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
            <XAxis dataKey="month" stroke="var(--ct-text-secondary)" fontSize={12} />
            <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="count" stroke="#000" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t('reviewQueue')}</h3>
          <button onClick={() => onTabChange('review')} className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
            {t('view')} <ChevronRight size={12} />
          </button>
        </div>
        {pendingCount === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noReviewItems')}</p>
        ) : (
          <div className="space-y-2">
            {mockReviewQueue.filter(r => r.status === 'pending').slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--ct-border)' }}>
                <div>
                  <p className="text-sm font-medium">{item.ownerName}</p>
                  <p className="text-xs font-mono opacity-60">{item.studentId} — {t('confidenceScore')}: {(item.confidenceScore * 100).toFixed(0)}%</p>
                </div>
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}