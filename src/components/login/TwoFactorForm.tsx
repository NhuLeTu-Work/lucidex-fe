import { Shield, AlertCircle, CheckCircle, Smartphone, Mail } from 'lucide-react';

export function TwoFactorForm({ hookProps }: { hookProps: any }) {
  const {
    view,
    currentAcc,
    otpMethod,
    otpValue,
    setOtpValue,
    otpError,
    isOtpLoading,
    handleVerify2FA,
    t,
    resendCountdown,
    isSwitchDisabled = false,
    otpSuccessMessage,
    handleResendOTP,
    handleSwitchMethod,
  } = hookProps;

  const isOwner = currentAcc?.type === 'owner';

  return (
    <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 animate-in zoom-in-95" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border mb-2" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
          <Shield size={22} style={{ color: 'var(--ct-text)' }} />
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-balance" style={{ color: 'var(--ct-text)' }}>
          {view === 'setup_2fa' ? (t('setup2FATitle') || 'Set up Two-Factor Authentication') : (t('login2FATitle') || 'Two-Factor Authentication')}
        </h2>
        <p className="text-sm opacity-70 text-balance" style={{ color: 'var(--ct-text)' }}>
          {otpMethod === 'email' ? (t('otpSentToEmail') || 'A 6-digit code has been sent to') : (t('otpSentToSMS') || 'A 6-digit code has been sent to')}
          <span className="block font-semibold opacity-100 mt-1">
            {otpMethod === 'email' ? currentAcc?.email : (currentAcc?.registrationData?.contactPhone || '+84 987 *** ***')}
          </span>
        </p>
      </div>

      {/* Thông báo gửi lại OTP thành công (AC 1) */}
      {otpSuccessMessage && !otpError && (
        <div className="p-3 rounded-xl border flex items-center gap-2 text-sm text-green-600 bg-green-500/10 border-green-500 dark:text-green-400 animate-in fade-in duration-300">
          <CheckCircle size={16} className="shrink-0" />
          <span className="font-medium text-balance">{t(otpSuccessMessage)}</span>
        </div>
      )}

      {/* Thông báo lỗi tổng quát / Lỗi Rate limit (AC 2) */}
      {otpError && (
        <div className="p-3 rounded-xl border flex items-center gap-2 text-sm animate-in shake" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium text-balance">{t(otpError)}</span>
        </div>
      )}

      <form onSubmit={handleVerify2FA} className="flex flex-col gap-4">
        {/* Input OTP */}
        <input 
          type="text" 
          value={otpValue} 
          onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))} 
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
            <><CheckCircle size={16} /><span>{t('verify2FA') || 'Verify & Continue'}</span></>
          )}
        </button>

          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="flex flex-col items-center gap-1">
        {!isOwner && (
              <button 
                type="button" 
                disabled={isOtpLoading || isSwitchDisabled}
                onClick={() => handleSwitchMethod(otpMethod === 'email' ? 'sms' : 'email')}
                className="text-xs font-semibold hover:underline flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:no-underline"
                style={{ color: 'var(--ct-text)' }}
              >
                {otpMethod === 'email' ? <Smartphone size={14} /> : <Mail size={14} />}
                {otpMethod === 'email' ? (t('switchToSMS') || 'Switch to SMS method') : (t('switchToEmail') || 'Switch to Email method')}
              </button>
              
            )}
            </div>

            <button 
            type="button" 
            disabled={isOtpLoading || resendCountdown > 0}
            onClick={handleResendOTP}
            className="px-4 py-2 text-xs font-medium rounded-full border transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-transparent"
            style={{ color: 'var(--ct-text)', borderColor: 'var(--ct-text)' }}
          >
            {resendCountdown > 0 
              ? `${t('resendOTP') || "Didn't receive a code? Resend"} (${resendCountdown}s)` 
              : (t('resendOTP') || "Didn't receive a code? Resend")
            }
          </button>
        </div>
      </form>
    </div>
  );
}