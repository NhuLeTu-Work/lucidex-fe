import { Key, AlertCircle, Mail, Lock, EyeOff, Eye, ShieldCheck, CheckCircle } from 'lucide-react';

export function SetupPasswordForm({ hookProps }: { hookProps: any }) {
  const {
    currentAcc, setupPassword, setSetupPassword, setupConfirm, setSetupConfirm,
    showSetupPwd, setShowSetupPwd, showConfirmPwd, setShowConfirmPwd,
    isSetupSuccess, error, isLoading, handleSetupAccount, t
  } = hookProps;

  return (
    <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 animate-in zoom-in-95" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
      {!isSetupSuccess ? (
        <>
          <div className="text-center flex flex-col gap-2">
            <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border mb-2" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
              <Key size={22} style={{ color: 'var(--ct-text)' }} />
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight" style={{ color: 'var(--ct-text)' }}>{t('setupAccountTitle') || 'Set Up Your Account'}</h2>
            <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>{t('setupAccountDesc') || 'Please set a secure password for your newly approved account.'}</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border flex items-start gap-2.5 text-sm animate-in shake" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium text-balance">{error}</span>
            </div>
          )}

          <form onSubmit={handleSetupAccount} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('emailAddress') || 'Email Address'}</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Mail size={16} /></span>
                <input type="email" value={currentAcc?.email} disabled className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border opacity-60 cursor-not-allowed" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('password') || 'Password'}</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Lock size={16} /></span>
                <input type={showSetupPwd ? 'text' : 'password'} value={setupPassword} disabled={isLoading} onChange={(e) => setSetupPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
                <button type="button" disabled={isLoading} onClick={() => setShowSetupPwd(!showSetupPwd)} className="absolute right-3.5 opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--ct-text)' }}>
                  {showSetupPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('confirmPassword') || 'Confirm Password'}</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><ShieldCheck size={16} /></span>
                <input type={showConfirmPwd ? 'text' : 'password'} value={setupConfirm} disabled={isLoading} onChange={(e) => setSetupConfirm(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
                <button type="button" disabled={isLoading} onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3.5 opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--ct-text)' }}>
                  {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
              {isLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><CheckCircle size={16} /><span>{t('setupAccountBtn') || 'Complete Setup'}</span></>}
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-500">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--ct-text)' }}>{t('setupSuccessTitle') || 'Account Created!'}</h3>
          <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>{t('setupSuccessDesc') || 'Redirecting to mandatory 2FA setup...'}</p>
          <div className="mt-6 w-6 h-6 border-2 border-current/30 border-t-current rounded-full animate-spin" style={{ color: 'var(--ct-text)' }} />
        </div>
      )}
    </div>
  );
}