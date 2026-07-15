import { CheckCircle } from 'lucide-react';
import type { AppContextType } from '../../App'; // Import AppContextType để lấy type gốc

interface SuccessStatusProps {
  setPage: AppContextType['setPage']; // <=== Lấy chính xác type của setPage từ AppContext
  t: (k: string) => string;
}

export function SuccessStatus({ setPage, t }: SuccessStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in zoom-in-95 duration-500 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
        <CheckCircle size={32} className="text-green-600 dark:text-green-500" />
      </div>
      <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--ct-text)' }}>
        {t('applicationSubmitted') || 'Application Submitted'}
      </h3>
      <p className="text-sm opacity-80 max-w-sm" style={{ color: 'var(--ct-text)' }}>
        {t('pendingReviewMsg') || 'Your registration application has been submitted successfully and is pending review.'}
      </p>
      <button 
        onClick={() => setPage('landing')} 
        className="mt-4 px-6 py-2 text-sm font-semibold rounded-lg border transition-all hover:opacity-70"
        style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
      >
        {t('returnHome') || 'Return to Home'}
      </button>
    </div>
  );
}