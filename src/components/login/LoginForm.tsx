import { Lock, AlertCircle, Mail, EyeOff, Eye, LogIn, ArrowRight, ShieldCheck, Building2, Award, GraduationCap } from 'lucide-react';
import { mockAccounts } from '../../data/mockData';

export function LoginForm({ hookProps }: { hookProps: any }) {
  const { 
    email, setEmail, password, setPassword, error, isLoading, 
    handleLogin, handleQuickLogin, showPassword, setShowPassword, t, setPage 
  } = hookProps;

  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'admin': return <ShieldCheck size={16} />;
      case 'verifier': return <Building2 size={16} />;
      case 'issuer': return <Award size={16} />;
      default: return <GraduationCap size={16} />;
    }
  };

  return (
    <>
      <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 transition-all" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="text-center flex flex-col gap-2">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border mb-2" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
            <Lock size={22} style={{ color: 'var(--ct-text)' }} />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight" style={{ color: 'var(--ct-text)' }}>{t('loginTitle') || 'Welcome back!'}</h2>
          <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>{t('loginSubtitle') || 'Sign in to access your workspace.'}</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl border flex items-center gap-2.5 text-sm animate-in shake duration-300" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('emailAddress') || 'Username or email'}</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Mail size={16} /></span>
              <input type="email" value={email} disabled={isLoading} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('password') || 'Password'}</label>
              <a href="#forgot" className="text-xs font-medium hover:underline opacity-70 hover:opacity-100" style={{ color: 'var(--ct-text)' }}>{t('forgotPassword') || 'Forgot Password?'}</a>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Lock size={16} /></span>
              <input type={showPassword ? 'text' : 'password'} value={password} disabled={isLoading} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              <button type="button" disabled={isLoading} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--ct-text)' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
            {isLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><LogIn size={16} /><span>{t('signIn') || 'Sign In'}</span></>}
          </button>

          <div className="mt-3 text-center text-sm flex items-center justify-center gap-1.5" style={{ color: 'var(--ct-text)' }}>
            <span className="opacity-70">{t('newHere') || 'New here?'}</span>
            <button type="button" onClick={() => setPage('register')} className="font-semibold hover:underline opacity-100">{t('createAccount') || 'Create an Account'}</button>
          </div>
        </form>
      </div>

      <div className="p-6 rounded-2xl border flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80" style={{ color: 'var(--ct-text)' }}>{t('demoAccounts') || 'Demo Accounts'}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {mockAccounts.filter(acc => ['acc_003', 'acc_002', 'iss_001', 'vef_001', 'admin_new', 'admin_returning'].includes(acc.id)).map((acc) => (
            <button key={acc.id} type="button" disabled={isLoading} onClick={() => handleQuickLogin(acc.email)} className="p-3 text-left rounded-xl border flex flex-col gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] group" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
              <div className="flex items-center justify-between w-full">
                <span className="p-1 rounded-md border text-xs opacity-70 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)', color: 'var(--ct-text)' }}>{getRoleIcon(acc.type)}</span>
                <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0 transition-all" style={{ color: 'var(--ct-text)' }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold truncate" style={{ color: 'var(--ct-text)' }}>{acc.name}</span>
                <span className="text-[9px] font-mono opacity-60 truncate" style={{ color: 'var(--ct-text)' }}>{acc.email}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}