import { Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function VerifierQuota({ t, quotaUsed }: { t: (k: string) => string; quotaUsed: number }) {
  const pct = (quotaUsed / 20) * 100;

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('quotaPlan')}</h1>

      <div className="max-w-lg p-8 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="text-center mb-6">
          <p className="text-sm opacity-60">{t('freeTier')}</p>
          <p className="font-display text-5xl mt-2">{quotaUsed}<span className="text-2xl opacity-30">/20</span></p>
          <p className="text-xs mt-2 opacity-50">{20 - quotaUsed} {t('remaining')}</p>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-6" style={{ background: 'var(--ct-border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? '#ef4444' : '#000' }} />
        </div>

        {pct >= 90 && (
          <button className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <Star size={16} className="inline mr-2" />
            {t('upgradePlan')}
          </button>
        )}
      </div>

      <div className="mt-8 p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('verificationsUsed')}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[{ name: 'Mon', v: 2 }, { name: 'Tue', v: 4 }, { name: 'Wed', v: 3 }, { name: 'Thu', v: 1 }, { name: 'Fri', v: 5 }, { name: 'Sat', v: 2 }, { name: 'Sun', v: 1 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
            <XAxis dataKey="name" stroke="var(--ct-text-secondary)" fontSize={12} />
            <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
            <Bar dataKey="v" fill="#000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}