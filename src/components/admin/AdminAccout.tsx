import { useState } from 'react';
import { KeyRound, Smartphone, CheckCircle, Send } from 'lucide-react';

export function AdminAccount({ t }: { t?: (key: string) => string }) {
  // Mockup states
  const [loadingType, setLoadingType] = useState<'password' | 'totp' | null>(null);
  const [requestedPassword, setRequestedPassword] = useState(false);
  const [requestedTotp, setRequestedTotp] = useState(false);

  // Fallback t()
  const translate = (key: string) => (t ? t(key) : key);

  // Mockup function để gửi request
  const handleRequest = (type: 'password' | 'totp') => {
    setLoadingType(type);
    setTimeout(() => {
      setLoadingType(null);
      if (type === 'password') setRequestedPassword(true);
      if (type === 'totp') setRequestedTotp(true);
    }, 1200);
  };

  return (
    <div className="animate-in fade-in max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-2xl text-[var(--ct-text)]">
          {translate('accountSettings') || 'Account Settings'}
        </h1>
      </div>

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
            onClick={() => handleRequest('password')}
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
            onClick={() => handleRequest('totp')}
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