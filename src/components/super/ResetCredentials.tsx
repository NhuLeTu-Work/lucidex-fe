import { Copy, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CredentialBoxProps {
  label: string;
  value: string;
  isPassword?: boolean;
  t: (key: string) => string;
}

// Sub-component: Hộp hiển thị từng thông tin (Username / Password)
function CredentialBox({ label, value, isPassword, t }: CredentialBoxProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="p-4 rounded-xl border bg-[var(--ct-surface)] border-[var(--ct-border)] shadow-sm">
      <p className="text-xs uppercase font-bold tracking-wider opacity-60 mb-1.5 text-[var(--ct-text)]">
        {label}
      </p>
      <div className="flex items-center justify-between gap-4">
        <span 
          className={`font-mono text-lg font-bold text-[var(--ct-text)] truncate ${isPassword ? 'tracking-[0.15em]' : ''}`}
        >
          {value}
        </span>
        <button 
          onClick={handleCopy} 
          title={t('copy') || 'Copy'}
          className="shrink-0 p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-[var(--ct-text)] opacity-60 hover:opacity-100 active:scale-95"
        >
          <Copy size={18} />
        </button>
      </div>
    </div>
  );
}

interface AdminCredentialDisplayProps {
  username: string;
  newPassword?: string;
  onClose: () => void;
  t: (key: string) => string;
}

// Main Component: Khung hiển thị sau khi Reset thành công
export function AdminCredentialDisplay({ username, newPassword, onClose, t }: AdminCredentialDisplayProps) {

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 max-w-lg w-full">
      <div className="p-6 rounded-2xl border border-[var(--ct-border)] bg-[var(--ct-bg)] shadow-xl relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none text-[var(--ct-text)]">
          <KeyRound size={160} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-[var(--ct-text)]">
              {t('resetSuccessful') || 'Reset Successful'}
            </h2>
            <p className="text-sm opacity-70 text-[var(--ct-text)]">
              {t('newCredentialsFor') || 'New credentials generated for'} <span className="font-semibold">{username}</span>
            </p>
          </div>
        </div>

        {/* Credentials Box */}
        <div className="flex flex-col gap-3 relative z-10 mb-6">
          <CredentialBox 
            label={t('adminUsername') || 'Username'} 
            value={username} 
            t={t} 
          />
          
          {newPassword && (
            <CredentialBox 
              label={t('tempPassword') || 'Temporary Password'} 
              value={newPassword} 
              isPassword 
              t={t} 
            />
          )}
        </div>

        <div className="flex flex-col gap-4 relative z-10">
          <div className="p-3.5 rounded-xl flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-500/90 text-sm">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('warningSavePassword') || 'Please copy and send this information to the operational admin securely. This password will not be shown again.'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.99] bg-[var(--ct-text)] text-[var(--ct-bg)] hover:opacity-90"
          >
            {t('closeAndFinish') || 'Close & Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}