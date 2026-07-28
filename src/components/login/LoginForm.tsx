import { Lock, AlertCircle, Mail, EyeOff, Eye, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GoogleLogin } from '@react-oauth/google';

export function LoginForm({ hookProps }: { hookProps: any }) {
  const { 
    email, setEmail, password, setPassword, error, isLoading, 
    handleLogin, showPassword, setShowPassword, t, 
    handleGoogleAuth
  } = hookProps;
  const navigate = useNavigate()

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
            <span className="font-medium">{t(error)}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('emailAddress') || 'Username or email'}</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Mail size={16} /></span>
              <input type="text" value={email} disabled={isLoading} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
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
            <button type="button" onClick={() => navigate('/register')} className="font-semibold hover:underline opacity-100">{t('createAccount')}</button>
          </div>
        </form>
      </div>

      <div className="relative flex items-center py-2">
            <div className="flex-grow border-t" style={{ borderColor: 'var(--ct-border)' }}></div>
            <span className="shrink-0 px-3 text-xs font-semibold uppercase tracking-wider opacity-40" style={{ color: 'var(--ct-text)' }}>{t('or') || 'or'}</span>
            <div className="flex-grow border-t" style={{ borderColor: 'var(--ct-border)' }}></div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  handleGoogleAuth(credentialResponse.credential);
                }
              }}
              onError={() => {
                console.log('Login Failed');
              }}
              useOneTap
            />
          </div>
    </>
  );
}