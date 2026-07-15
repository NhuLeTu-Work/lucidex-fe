import { useState } from 'react';

export function OwnerConsent({ t }: { t: (k: string) => string }) {
  const [defaultConsent, setDefaultConsent] = useState('per_request');
  const [autoApprove, setAutoApprove] = useState<string[]>(['TMA Solutions']);

  const consentOptions = [
    { value: 'one_time', label: t('oneTimeConsent'), desc: 'Dong y cho tung lan xac minh rieng le' },
    { value: 'per_request', label: t('perRequestConsent'), desc: 'Hoi lai moi khi co yeu cau xac minh' },
    { value: 'org_level', label: t('orgLevelConsent'), desc: 'Dong y 1 lan cho to chuc cu thê' },
    { value: 'time_bound', label: t('timeBoundConsent'), desc: 'Dong y co thoi han tu chon' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">{t('consentSettings')}</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ct-text-secondary)' }}>{t('consentSettingsDesc')}</p>

      <div className="max-w-xl space-y-6">
        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('setDefaultConsent')}</h3>
          <div className="space-y-2">
            {consentOptions.map(opt => (
              <button key={opt.value} onClick={() => setDefaultConsent(opt.value)} className={`w-full text-left p-3 rounded-lg border transition-all ${defaultConsent === opt.value ? 'border-black' : 'opacity-70'}`} style={{ background: defaultConsent === opt.value ? 'var(--ct-bg)' : 'transparent', borderColor: defaultConsent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center`} style={{ borderColor: defaultConsent === opt.value ? 'var(--ct-text)' : 'var(--ct-border)' }}>
                    {defaultConsent === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ct-text)' }} />}
                  </div>
                  <span className="font-medium text-sm">{opt.label}</span>
                </div>
                <p className="text-xs mt-1 ml-6 opacity-60">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          <h3 className="font-semibold mb-4">{t('autoApproveFor')}</h3>
          <div className="space-y-2">
            {['TMA Solutions', 'FPT Software', 'Viettel'].map(org => (
              <label key={org} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                <input type="checkbox" checked={autoApprove.includes(org)} onChange={(e) => {
                  if (e.target.checked) setAutoApprove([...autoApprove, org]);
                  else setAutoApprove(autoApprove.filter(o => o !== org));
                }} className="w-4 h-4 rounded" />
                <span className="text-sm">{org}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
          {t('save')}
        </button>
      </div>
    </div>
  );
}