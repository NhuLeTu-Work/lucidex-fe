import { mockAuditLog, mockCredentials, currentOwner } from '../../data/mockData';

export function OwnerAudit({ t }: { t: (k: string) => string }) {
  const myAudit = mockAuditLog.filter(a => mockCredentials.filter(c => c.studentId === currentOwner.studentId).some(c => c.id === a.credentialId));

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('auditLog')}</h1>
      {myAudit.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noAuditLogs')}</p>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--ct-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)' }}>
                <th className="text-left px-4 py-3 font-medium">{t('date')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('verifiedBy')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {myAudit.map(entry => (
                <tr key={entry.id} className="border-t transition-colors hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{entry.verifiedBy}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${entry.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}