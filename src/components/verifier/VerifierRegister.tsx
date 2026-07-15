import { useState } from 'react';
import { Upload, Shield, CheckCircle } from 'lucide-react';

export function VerifierRegister({ t }: { t: (k: string) => string }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t('orgRegistration')}</h1>

      {submitted ? (
        <div className="max-w-lg p-8 rounded-2xl border text-center" style={{ borderColor: '#22c55e', background: 'var(--ct-accent-green)' }}>
          <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
          <h3 className="font-display text-xl mb-2">{t('regSuccess')}</h3>
          <p className="text-sm opacity-60">Status: {t('pending')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div className="p-6 rounded-2xl border" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('orgName')}</label>
                <input type="text" required placeholder="Cong ty TNHH ABC" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('taxId')}</label>
                <input type="text" required placeholder="0123456789" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none font-mono" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('businessLicense')}</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:opacity-80" style={{ borderColor: 'var(--ct-border)' }}>
                  <Upload size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">{t('uploadLicense')}</p>
                  <p className="text-xs mt-1 opacity-50">PDF, JPG, PNG</p>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-80" style={{ background: '#000' }}>
            <Shield size={16} className="inline mr-2" />
            {t('submitForApproval')}
          </button>
        </form>
      )}
    </div>
  );
}