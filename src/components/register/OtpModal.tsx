import { X, Shield, AlertCircle, CheckCircle } from 'lucide-react';

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
      <div className="w-full max-w-md p-8 rounded-2xl border shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-300 relative" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        
        {/* Nút đóng */}
        <button onClick={onClose} className="absolute top-5 right-5 p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--ct-text)' }}>
          <X size={20} />
        </button>

        {/* Header (Identical UI to TwoFactorForm) */}
        <div className="text-center flex flex-col gap-2 mt-2">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border mb-2" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
            <Shield size={22} style={{ color: 'var(--ct-text)' }} />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-balance" style={{ color: 'var(--ct-text)' }}>
            {t('verifyEmail') || 'Verify your email'}
          </h2>
          <p className="text-sm opacity-70 text-balance" style={{ color: 'var(--ct-text)' }}>
            {t('otpSentDesc') || 'A 6-digit code has been sent to'}
            <span className="block font-semibold opacity-100 mt-1">
              {email}
            </span>
          </p>
        </div>

        {/* Error Box */}
        {otpError && (
          <div className="p-3 rounded-xl border flex items-center gap-2 text-sm animate-in shake" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
            <AlertCircle size={16} /><span>{otpError}</span>
          </div>
        )}

        {/* Form Verify */}
        <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="flex flex-col gap-4">
          <input 
            type="text" 
            value={otpValue} 
            onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))} 
            onFocus={(e) => e.target.select()} // Bôi đen text cũ khi focus lại để dễ dàng gõ đè OTP mới
            placeholder="000000" 
            maxLength={6} 
            disabled={isOtpLoading}
            autoFocus
            className="w-full px-4 py-3 rounded-xl border text-xl text-center font-mono tracking-[0.5em] outline-none focus:border-neutral-400 transition-all disabled:opacity-50" 
            style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} 
          />

          <button 
            type="submit"
            disabled={isOtpLoading || otpValue.length < 6}
            className="w-full py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" 
            style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}
          >
            {isOtpLoading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <><CheckCircle size={16} /><span>{t('verifyAndProceed') || 'Verify & Proceed'}</span></>
            )}
          </button>

          <div className="flex flex-col items-center gap-3 mt-2">
            <button 
              type="button" 
              disabled={isOtpLoading}
              onClick={() => { setOtpValue(''); /* Nơi bạn có thể hook trigger resend event */ }}
              className="text-xs opacity-60 hover:opacity-100 hover:underline transition-all disabled:opacity-40"
              style={{ color: 'var(--ct-text)' }}
            >
              {t('resendOTP') || 'Didn\'t receive a code? Resend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}