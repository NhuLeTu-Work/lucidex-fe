import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface OtpModalProps {
  email: string;
  otpValue: string;
  setOtpValue: (v: string) => void;
  otpError: string | null;
  isOtpLoading: boolean;
  onVerify: () => void;
  onClose: () => void;
  t: (k: string) => string;
}

export function OtpModal({ email, otpValue, setOtpValue, otpError, isOtpLoading, onVerify, onClose, t }: OtpModalProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl border p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-6" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
        
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--ct-text)' }}>
              {t('verifyEmail') || 'Verify your email'}
            </h3>
            <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>
              {t('otpSentDesc') || `We've sent a 6-digit code to`} <span className="font-semibold opacity-100">{email}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--ct-text)' }}><X size={20} /></button>
        </div>

        <div className="p-3 rounded-lg text-center font-mono text-sm tracking-widest border" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
          123456 <span className="tracking-normal font-sans text-xs opacity-50 ml-2">(Valid)</span> | 000000 <span className="tracking-normal font-sans text-xs opacity-50 ml-2">(Expired)</span>
        </div>

        {otpError && (
          <div className="p-3 rounded-xl border flex items-center gap-2 text-sm animate-in shake" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
            <AlertCircle size={16} /><span>{otpError}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input type="text" value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))} placeholder="000000" maxLength={6} disabled={isOtpLoading} className="w-full px-4 py-3 rounded-xl border text-xl text-center font-mono tracking-[0.5em] outline-none focus:border-neutral-400 transition-all disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
          <button onClick={onVerify} disabled={isOtpLoading || otpValue.length < 6} className="w-full py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
            {isOtpLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><CheckCircle size={16} />{t('verifyAndProceed') || 'Verify & Proceed'}</>}
          </button>
          <button type="button" disabled={isOtpLoading} onClick={onVerify} className="w-full mt-1 py-2 text-xs opacity-70 hover:opacity-100 hover:underline transition-all disabled:opacity-40" style={{ color: 'var(--ct-text)' }}>
            {t('resendOTP') || 'Didn\'t receive a code? Resend'}
          </button>
        </div>
      </div>
    </div>
  );
}