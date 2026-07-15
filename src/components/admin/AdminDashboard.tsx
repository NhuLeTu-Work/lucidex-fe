import { Inbox, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { monthlyVerifications } from '../../data/mockData';
import { StatCard } from './StatCard';

// Nhận props 'accounts' trực tiếp thay vì nhận accountTypeData
export function AdminDashboard({ t, pendingCount, totalAccounts, onTabChange, accounts =[] }: any) {
  
  // Đưa logic tính toán tỷ lệ tài khoản vào thẳng component này để tự động cập nhật
  const accountTypeData = [
    { name: t('owner') || 'Owner', value: accounts.filter((a: any) => a.type === 'owner').length },
    { name: t('issuer') || 'Issuer', value: accounts.filter((a: any) => a.type === 'issuer').length },
    { name: t('verifier') || 'Verifier', value: accounts.filter((a: any) => a.type === 'verifier').length },
    { name: t('admin') || 'Admin', value: accounts.filter((a: any) => a.type === 'admin').length },
  ];
  const COLORS = ['#000000', '#666666', '#999999', '#cccccc'];

  return (
    <div className="animate-in fade-in">
      <h1 className="font-display text-2xl mb-2" style={{ color: 'var(--ct-text)' }}>{t('welcomeAdmin') || 'Welcome back, Admin'}</h1>
      <p className="text-sm mb-8 opacity-70" style={{ color: 'var(--ct-text)' }}>System Overview</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('pendingRequests') || 'Pending Requests'} value={pendingCount.toString()} icon={<Inbox size={20} />} badge={pendingCount > 0 ? pendingCount.toString() : undefined} onClick={() => onTabChange('requests')} />
        <StatCard label={t('accounts') || 'Total Accounts'} value={totalAccounts.toString()} icon={<Users size={20} />} onClick={() => onTabChange('accounts')} />
        <StatCard label={t('verificationsThisMonth') || 'Verifications'} value="58" icon={<TrendingUp size={20} />} onClick={() => {}} />
        <StatCard label="System Status" value="OK" icon={<ShieldCheck size={20} />} onClick={() => {}} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ct-text)' }}>{t('verifyTrends') || 'Verification Trends'}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyVerifications}>
              <defs>
                <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ct-border)" />
              <XAxis dataKey="month" stroke="var(--ct-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--ct-text-secondary)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--ct-surface)', border: '1px solid var(--ct-border)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="count" stroke="var(--ct-text)" fill="url(#adminGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ct-text)' }}>{t('accounts') || 'Accounts Distribution'}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={accountTypeData} 
                cx="50%" cy="50%" 
                innerRadius={60} outerRadius={90} 
                paddingAngle={4} 
                dataKey="value"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (percent < 0.05) return null;
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {accountTypeData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              
              {/* Custom Tooltip */}
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const total = accountTypeData.reduce((sum: number, item: any) => sum + item.value, 0);
                    const percent = total > 0 ? ((data.value as number) / total * 100).toFixed(1) : 0;
                    return (
                      <div className="px-3 py-2 rounded-lg border shadow-sm text-sm" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
                        <div className="font-semibold mb-0.5 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: data.payload.fill }}></div>
                          {data.name}
                        </div>
                        <div className="opacity-80 ml-4">
                          {data.value} <span className="text-xs">({percent}%)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center flex-wrap gap-4 mt-2">
            {accountTypeData.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-xs opacity-70" style={{ color: 'var(--ct-text)' }}>
                  {entry.name}: <span className="font-semibold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}