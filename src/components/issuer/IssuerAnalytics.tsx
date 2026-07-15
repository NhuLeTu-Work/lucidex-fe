import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { monthlyVerifications, topEmployers, topMajors } from '../../data/mockData';

interface IssuerAnalyticsProps {
  t: (k: string) => string;
}

export function IssuerAnalytics({ t }: IssuerAnalyticsProps) {
  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('analytics')}</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('verifyTrends')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyVerifications}>
              <defs>
                <linearGradient id="colorCount2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
              <XAxis dataKey="month" stroke="var(--ct-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="count" stroke="#000" fill="url(#colorCount2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('topEmployers')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topEmployers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
              <XAxis type="number" stroke="var(--ct-text-secondary)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="var(--ct-text-secondary)" fontSize={12} width={100} />
              <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#000" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <h3 className="font-semibold mb-4">{t('topMajors')}</h3>
        <div className="grid sm:grid-cols-5 gap-4">
          {topMajors.map((major, idx) => (
            <div key={idx} className="text-center p-4 rounded-xl border" style={{ borderColor: 'var(--ct-border)' }}>
              <p className="font-display text-2xl">{major.count}</p>
              <p className="text-xs mt-1 opacity-60">{major.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}