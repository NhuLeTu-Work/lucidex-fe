import { XCircle } from 'lucide-react';
import { RegistrationDataCard } from './RegistrationDataCard';
import type { Account } from '../../data/mockData';

export function RejectedStatus({ currentAcc, setPage, t }: { currentAcc: Account; setPage: any; t: (k: string) => string }) {
  if (!currentAcc.registrationData) return null;

  return (
    <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 text-center animate-in zoom-in-95" style={{ borderColor: '#ef4444', background: 'var(--ct-surface)' }}>
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
        <XCircle size={32} />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--ct-text)' }}>{t('rejectedTitle') || 'Application Rejected'}</h2>
        <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>{t('rejectedDesc') || 'Unfortunately, your registration has been rejected. Thank you for your interest.'}</p>
      </div>
      <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm text-left dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300">
        <span className="font-semibold block mb-1">{t('rejectionReason') || 'Reason for rejection'}:</span>
        {currentAcc.registrationData.rejectedReason}
      </div>
      <RegistrationDataCard data={currentAcc.registrationData} t={t} />
      <button onClick={() => setPage('landing')} className="mt-2 w-full py-3 text-sm font-semibold rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
        {t('backToHome') || 'Back to Landing Page'}
      </button>
    </div>
  );
}