import { Lock, EyeOff, Eye, ShieldAlert, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
export function OrgSetupPasswordForm({ hookProps }: { hookProps: any }) {
  const navigate = useNavigate();
  const {
    password, setPassword, 
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, 
    showConfirmPassword, setShowConfirmPassword,
    isLoading, handleSetupPassword, 
    t, isLinkInvalid
  } = hookProps;
  if (isLinkInvalid) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-semibold" style={{ color: 'var(--ct-text)' }}>
          {t('linkInvalidTitle') || 'Link Invalid or Expired'}
        </h3>
        <p className="text-sm opacity-70 mb-4 text-balance max-w-sm" style={{ color: 'var(--ct-text)' }}>
          {t('linkInvalidDesc') || 'This link has been used, expired, or is no longer valid. You cannot access this page anymore.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 text-sm font-semibold rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center gap-2"
          style={{ color: 'var(--ct-text)', borderColor: 'var(--ct-border)' }}
        >
          <ArrowLeft size={16} />
          {t('backToHome') || 'Back to Home'}
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={handleSetupPassword} className="flex flex-col gap-4 animate-in fade-in">
            
      {/* Trường Mật khẩu */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('password') || 'Password'}</label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Lock size={16} /></span>
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            disabled={isLoading} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••" 
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" 
            style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} 
          />
          <button type="button" disabled={isLoading} onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--ct-text)' }}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      {/* Trường Xác nhận mật khẩu */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>{t('confirmPassword') || 'Confirm Password'}</label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><ShieldAlert size={16} /></span>
          <input 
            type={showConfirmPassword ? 'text' : 'password'} 
            value={confirmPassword} 
            disabled={isLoading} 
            onChange={e => setConfirmPassword(e.target.value)} 
            placeholder="••••••••" 
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" 
            style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} 
          />
          <button type="button" disabled={isLoading} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--ct-text)' }}>
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      {/* Nút Submit */}
      <button 
        type="submit" 
        disabled={isLoading || !password || !confirmPassword} 
        className="w-full mt-2 py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" 
        style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <>
            <CheckCircle size={16} />
            <span>{t('setupPassword') || 'Set Up Password'}</span>
          </>
        )}
      </button>
    </form>
  );
}