import { FileText } from 'lucide-react';
import { mockVerifierVerifyHistory } from '../../data/mockData';

export function VerifierHistory({ t }: { t: (k: string) => string }) {
  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('verifyHistory')}</h1>
      {mockVerifierVerifyHistory.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noVerifyHistory')}</p>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--ct-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)' }}>
                <th className="text-left px-4 py-3 font-medium">{t('date')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('ownerName')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('institution')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('status')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {mockVerifierVerifyHistory.map(h => (
                <tr key={h.id} className="border-t transition-colors hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs">{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{h.ownerName}</td>
                  <td className="px-4 py-3 text-xs">{h.institution}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.result === 'valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {h.result === 'valid' ? 'Valid' : 'Invalid'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                      <FileText size={12} /> PDF
                    </button>
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