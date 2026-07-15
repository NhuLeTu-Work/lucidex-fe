import { Clock } from 'lucide-react';
import { RegistrationDataCard } from './RegistrationDataCard';
import type { Account } from '../../data/mockData';

export function PendingStatus({ currentAcc, setView, t }: { currentAcc: Account; setView: any; t: (k: string) => string }) {
  if (!currentAcc.registrationData) return null;
  
  return (
    <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 text-center animate-in zoom-in-95" style={{ borderColor: '#3b82f6', background: 'var(--ct-surface)' }}>
      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        <Clock size={32} />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--ct-text)' }}>{t('pendingReviewTitle') || 'Application Under Review'}</h2>
        <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>{t('pendingReviewDesc') || 'Your registration is currently pending review by an administrator.'}</p>
      </div>
      <RegistrationDataCard data={currentAcc.registrationData} t={t} />
      <button onClick={() => setView('login')} className="mt-2 w-full py-3 text-sm font-semibold rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
        {t('backToLogin') || 'Back to Login'}
      </button>
    </div>
  );
}