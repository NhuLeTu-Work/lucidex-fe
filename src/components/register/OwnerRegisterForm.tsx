import { Mail, Lock, EyeOff, Eye, ShieldAlert, UserPlus } from 'lucide-react';

export function OwnerRegisterForm({ hookProps }: { hookProps: any }) {
  const {
    email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    isLoading, handleOwnerRegister, setRole, setPage, t
  } = hookProps;

  return (
    <form onSubmit={handleOwnerRegister} className="flex flex-col gap-4 animate-in fade-in">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
          {t('emailAddress') || 'Email Address'}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Mail size={16} /></span>
          <input type="email" value={email} disabled={isLoading} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('password') || 'Password'}</label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Lock size={16} /></span>
          <input type={showPassword ? 'text' : 'password'} value={password} disabled={isLoading} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
          <button type="button" disabled={isLoading} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--ct-text)' }}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('confirmPassword') || 'Confirm Password'}</label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><ShieldAlert size={16} /></span>
          <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} disabled={isLoading} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
          <button type="button" disabled={isLoading} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--ct-text)' }}>
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
        {isLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><UserPlus size={16} /><span>{t('signUp') || 'Sign Up'}</span></>}
      </button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t" style={{ borderColor: 'var(--ct-border)' }}></div>
        <span className="shrink-0 px-3 text-xs font-semibold uppercase tracking-wider opacity-40" style={{ color: 'var(--ct-text)' }}>{t('or') || 'or'}</span>
        <div className="flex-grow border-t" style={{ borderColor: 'var(--ct-border)' }}></div>
      </div>

      <button type="button" disabled={isLoading} onClick={() => { setRole('owner'); setPage('owner'); }} className="w-full py-2.5 text-sm font-semibold rounded-xl border shadow-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)', background: 'var(--ct-surface)' }}>
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        <span>{t('signUpWithGoogle') || 'Sign up with Google Account'}</span>
      </button>
    </form>
  );
}