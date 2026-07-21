import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

export function AdminGoogleAuthForm({ hookProps }: { hookProps: any }) {
  const { view, otpValue, setOtpValue, otpError, isOtpLoading, handleVerify2FA, t,
    qrCode, manualEntryKey
  } = hookProps;

  return (
    <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 animate-in zoom-in-95" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      <div className="text-center flex flex-col gap-2">
        <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border mb-2" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
          <ShieldCheck size={22} style={{ color: 'var(--ct-text)' }} />
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-balance" style={{ color: 'var(--ct-text)' }}>
          {view === 'setup_2fa' ? (t('setupGoogleAuthTitle') || 'Setup Authenticator') : (t('loginGoogleAuthTitle') || 'Authenticator App')}
        </h2>
        <p className="text-sm opacity-70 text-balance" style={{ color: 'var(--ct-text)' }}>
          {view === 'setup_2fa' 
            ? (t('setupGoogleAuthDesc') || 'Scan the QR code with your Authenticator app and enter the 6-digit code.') 
            : (t('loginGoogleAuthDesc') || 'Open your Authenticator app and enter the 6-digit code.')}
        </p>
      </div>

      {/* CHỈ HIỂN THỊ MÃ QR KHI LÀ ADMIN ĐĂNG NHẬP LẦN ĐẦU */}
      {view === 'setup_2fa' && (
        <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-gray-200 gap-4 shadow-sm">
          {/* Hình ảnh QR Code */}
          <img src={qrCode} alt="QR Code" className="w-32 h-32" />
          
          {/* Mã nhập thủ công (Nếu có) */}
          {manualEntryKey && (
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="text-xs font-medium text-gray-500 text-center text-balance">
                {t('cantScanQR') || "Can't scan the QR code? Use this setup key:"}
              </span>
              <code className="text-xs font-mono tracking-widest bg-gray-50 text-gray-800 px-3 py-2 rounded-lg border border-gray-100 w-full text-center break-all select-all">
                {manualEntryKey}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Thông báo lỗi: Invalid code or code has expired */}
      {otpError && (
        <div className="p-3 rounded-xl border flex items-center gap-2 text-sm animate-in shake" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium text-balance">{t(otpError)}</span>
        </div>
      )}

      <form onSubmit={handleVerify2FA} className="flex flex-col gap-4">
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
      </form>
    </div>
  );
}