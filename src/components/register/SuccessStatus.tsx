import { CheckCircle } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { useNavigate } from 'react-router-dom';

// Thêm interface để nhận prop roleType
interface SuccessStatusProps {
  roleType: string;
}

export function SuccessStatus({ roleType }: SuccessStatusProps) {
  const { t } = useApp();
  const navigate = useNavigate();

  // Viết hoa chữ cái đầu tiên của role (ví dụ: "issuer" -> "Issuer")
  const displayRole = roleType.charAt(0).toUpperCase() + roleType.slice(1);

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in zoom-in-95 duration-500 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
        <CheckCircle size={32} className="text-green-600 dark:text-green-500" />
      </div>
      <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--ct-text)' }}>
        {t('applicationSubmitted') || 'Application Submitted'}
      </h3>
      <p className="text-sm opacity-80 max-w-sm" style={{ color: 'var(--ct-text)' }}>
        {/* Render thông báo động dựa trên roleType */}
        {t(`pendingReviewMsg${displayRole}`) || `Your registration for ${displayRole} application has been submitted successfully and is pending review.`}
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-4 px-6 py-2 text-sm font-semibold rounded-lg border transition-all hover:opacity-70"
        style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
      >
        {t('returnHome') || 'Return to Home'}
      </button>
    </div>
  );
}