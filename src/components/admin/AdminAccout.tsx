import { KeyRound, Smartphone, CheckCircle, Send, AlertCircle } from 'lucide-react';
import { useAdminAccountSettings } from '../../hooks/admin/useAdminAccountSettings';

export function AdminAccount({ t }: { t?: (key: string) => string }) {
  const {
    loadingType,
    requestedPassword,
    requestedTotp,
    errorKey,
    handleRequestPasswordReset,
    handleRequestTotpReset
  } = useAdminAccountSettings();

  const translate = (key: string) => (t ? t(key) : key);

  return (
    <div className="animate-in fade-in max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl text-[var(--ct-text)]">
          {translate('accountSettings') || 'Account Settings'}
        </h1>
      </div>

      {/* Hiển thị lỗi toàn cục nếu API fail */}
      {errorKey && (
        <div className="mb-6 p-3.5 rounded-xl border flex items-start gap-2.5 text-sm animate-in shake duration-300" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium text-balance">{translate(errorKey)}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Request Reset Password */}
        <div className="p-6 rounded-2xl border flex flex-col gap-4 border-[var(--ct-border)] bg-[var(--ct-surface)] hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center gap-3 text-[var(--ct-text)]">
            <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl">
              <KeyRound size={20} />
            </div>
            <h3 className="font-semibold text-lg">{translate('requestResetPassword') || 'Request Reset Password'}</h3>
          </div>
          
          <p className="text-sm opacity-70 flex-grow text-[var(--ct-text)] leading-relaxed">
            {translate('descResetPassword') || 'Your request will be sent to Super Admin for them to reset your password. They will then notice you the new password privately.'}
          </p>
          
          <button 
            onClick={handleRequestPasswordReset}
            disabled={requestedPassword || loadingType !== null}
            className={`mt-2 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              requestedPassword 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 cursor-not-allowed' 
                : 'bg-[var(--ct-text)] text-[var(--ct-bg)] hover:opacity-90 active:scale-[0.99] disabled:opacity-50'
            }`}
          >
            {loadingType === 'password' ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : requestedPassword ? (
              <><CheckCircle size={16} /> <span>{translate('requestSent') || 'Request Sent'}</span></>
            ) : (
              <><Send size={16} /> <span>{translate('sendRequest') || 'Send Request'}</span></>
            )}
          </button>
        </div>

        {/* Card 2: Request Reset Key (TOTP) */}
        <div className="p-6 rounded-2xl border flex flex-col gap-4 border-[var(--ct-border)] bg-[var(--ct-surface)] hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div className="flex items-center gap-3 text-[var(--ct-text)]">
            <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl">
              <Smartphone size={20} />
            </div>
            <h3 className="font-semibold text-lg">{translate('requestResetKey') || 'Request Reset Key'}</h3>
          </div>
          
          <p className="text-sm opacity-70 flex-grow text-[var(--ct-text)] leading-relaxed">
            {translate('descResetKey') || 'Your request will be sent to Super Admin for them to reset your key for TOTP. For your next login, the QR for the key will be displayed.'}
          </p>
          
          <button 
            onClick={handleRequestTotpReset}
            disabled={requestedTotp || loadingType !== null}
            className={`mt-2 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              requestedTotp 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 cursor-not-allowed' 
                : 'bg-[var(--ct-text)] text-[var(--ct-bg)] hover:opacity-90 active:scale-[0.99] disabled:opacity-50'
            }`}
          >
            {loadingType === 'totp' ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : requestedTotp ? (
              <><CheckCircle size={16} /> <span>{translate('requestSent') || 'Request Sent'}</span></>
            ) : (
              <><Send size={16} /> <span>{translate('sendRequest') || 'Send Request'}</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}