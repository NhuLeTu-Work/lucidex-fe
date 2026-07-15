import { useState } from 'react';
import { Plus, Link2, Trash2 } from 'lucide-react';
import type { VerifiedLink } from '../../types/owner';

interface OwnerLinksProps {
  t: (k: string) => string;
  links: VerifiedLink[];
  onRevoke: (id: string) => void;
  onCreate: () => void;
}

export function OwnerLinks({ t, links, onRevoke, onCreate }: OwnerLinksProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">{t('verifiedLinks')}</h1>
        <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
          <Plus size={16} />
          {t('create')}
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ct-text-secondary)' }}>{t('noLinks')}</p>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <div key={link.id} className="p-5 rounded-xl border transition-all" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)', opacity: link.status === 'revoked' ? 0.6 : 1 }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${link.status === 'active' ? 'bg-green-100 text-green-700' : link.status === 'revoked' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {link.status === 'active' ? t('active') : link.status === 'revoked' ? t('revoked') : t('expired')}
                    </span>
                    <span className="text-xs opacity-50">{link.expiryLabel}</span>
                  </div>
                  <p className="text-sm font-mono truncate">{link.url}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs opacity-60">
                    <span>{t('consentType')}: {link.consentType}</span>
                    <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => navigator.clipboard?.writeText(link.url)} className="p-2 rounded-lg border transition-opacity hover:opacity-70" style={{ borderColor: 'var(--ct-border)' }} title="Copy">
                    <Link2 size={14} />
                  </button>
                  {link.status === 'active' && (
                    <button onClick={() => setRevokingId(link.id)} className="p-2 rounded-lg border transition-opacity hover:opacity-70" style={{ borderColor: 'var(--ct-border)', color: '#ef4444' }} title={t('revokeLink')}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {revokingId === link.id && (
                <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: '#fecaca', background: 'var(--ct-accent-red)' }}>
                  <p className="text-sm mb-2">{t('revokeConfirm')}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { onRevoke(link.id); setRevokingId(null); }} className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors">{t('confirm')}</button>
                    <button onClick={() => setRevokingId(null)} className="px-3 py-1.5 text-xs rounded-lg border transition-opacity hover:opacity-70" style={{ borderColor: 'var(--ct-border)' }}>{t('cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}