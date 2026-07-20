import { useState } from 'react';
import { Search } from 'lucide-react';
import type { SystemAuditLog } from '../../types/superAdmin';

interface Props {
  logs: SystemAuditLog[];
  t: (key: string) => string; // <=== Thêm prop t
}

export function AuditLogTab({ logs, t }: Props) {
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(filter.toLowerCase()) || 
    l.target.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="animate-in fade-in">
      <h1 className="font-display text-2xl mb-6 text-[var(--ct-text)]">{t('systemAuditLogTitle')}</h1>
      
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-[var(--ct-text)]" />
        <input 
          type="text" 
          value={filter} 
          onChange={e => setFilter(e.target.value)} 
          placeholder={t('filterPlaceholder')} 
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none bg-[var(--ct-bg)] border-[var(--ct-border)] text-[var(--ct-text)]" 
        />
      </div>

      <div className="rounded-xl border overflow-hidden border-[var(--ct-border)]">
        <table className="w-full text-sm text-left">
          <thead style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
            <tr>
              <th className="px-4 py-3 font-semibold">{t('timestamp')}</th>
              <th className="px-4 py-3 font-semibold">{t('actor')}</th>
              <th className="px-4 py-3 font-semibold">{t('action')}</th>
              <th className="px-4 py-3 font-semibold">{t('target')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 border-[var(--ct-border)] text-[var(--ct-text)]">
                <td className="px-4 py-3 font-mono text-xs opacity-70">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{log.actor}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <p className="p-6 text-center text-sm opacity-50 text-[var(--ct-text)]">
            {t('noAuditLogsFound')}
          </p>
        )}
      </div>
    </div>
  );
}