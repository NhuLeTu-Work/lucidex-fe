import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateLinkModalProps {
  t: (k: string) => string;
  onClose: () => void;
  onCreate: (expiry: string, consent: string) => void;
}

export function CreateLinkModal({ t, onClose, onCreate }: CreateLinkModalProps) {
  const [expiry, setExpiry] = useState('7d');
  const [consent, setConsent] = useState('one_time');

  const expiryOptions = [
    { value: '24h', label: t('hours24') },
    { value: '7d', label: t('days7') },
    { value: '30d', label: t('days30') },
    { value: 'permanent', label: t('permanent') },
  ];

  const consentOptions = [
    { value: 'one_time', label: t('oneTimeConsent') },
    { value: 'per_request', label: t('perRequestConsent') },
    { value: 'org_level', label: t('orgLevelConsent') },
    { value: 'time_bound', label: t('timeBoundConsent') },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-2xl" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">{t('createVerifiedLink')}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70 transition-opacity"><X size={18} /></button>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">{t('linkExpiry')}</label>
          <div className="grid grid-cols-2 gap-2">
            {expiryOptions.map(opt => (
              <button key={opt.value} onClick={() => setExpiry(opt.value)} className={`px-3 py-2.5 rounded-lg text-sm border transition-all ${expiry === opt.value ? 'border-black font-semibold' : 'opacity-60'}`} style={{ background: expiry === opt.value ? 'var(--ct-bg)' : 'transparent', borderColor: expiry === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">{t('consentType')}</label>
          <div className="space-y-2">
            {consentOptions.map(opt => (
              <button key={opt.value} onClick={() => setConsent(opt.value)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm border transition-all flex items-center gap-2 ${consent === opt.value ? 'border-black font-semibold' : 'opacity-60'}`} style={{ background: consent === opt.value ? 'var(--ct-bg)' : 'transparent', borderColor: consent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${consent === opt.value ? 'border-black' : ''}`} style={{ borderColor: consent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                  {consent === opt.value && <div className="w-2 h-2 rounded-full bg-black" />}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => onCreate(expiry, consent)} className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
          {t('createVerifiedLink')}
        </button>
      </div>
    </div>
  );
}