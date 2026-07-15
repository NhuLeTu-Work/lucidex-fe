import { useState } from 'react';
import { Search } from 'lucide-react';

export function AdminAccounts({ t, accounts }: { t: (k: string) => string, accounts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = accounts.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="animate-in fade-in">
      <h1 className="font-display text-2xl mb-6" style={{ color: 'var(--ct-text)' }}>{t('accounts') || 'Accounts'}</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: 'var(--ct-text)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('search') || 'Search...'} className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
          <option value="all">{t('all') || 'All Types'}</option>
          <option value="owner">{t('owner') || 'Owner'}</option>
          <option value="issuer">{t('issuer') || 'Issuer'}</option>
          <option value="verifier">{t('verifier') || 'Verifier'}</option>
          <option value="admin">{t('admin') || 'Admin'}</option>
        </select>
      </div>

      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: 'var(--ct-border)' }}>
        <table className="w-full text-sm text-left">
          <thead>
            <tr style={{ background: 'var(--ct-surface)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(acc => (
              <tr key={acc.id} className="border-t transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
                <td className="px-4 py-3 font-medium">{acc.name}</td>
                <td className="px-4 py-3 text-xs font-mono opacity-70">{acc.email}</td>
                <td className="px-4 py-3 uppercase text-[10px] tracking-wider font-bold">{acc.type}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${acc.status === 'active' || acc.status === 'setup_required' ? 'bg-green-100 text-green-700' : acc.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {acc.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}