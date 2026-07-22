import { Mail, Lock, EyeOff, Eye, ShieldAlert, CheckCircle } from 'lucide-react';

export function OrgSetupPasswordForm({ hookProps }: { hookProps: any }) {
  const {
    email, // Nhận email từ token/backend
    password, setPassword, 
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, 
    showConfirmPassword, setShowConfirmPassword,
    isLoading, handleSetupPassword, // Hàm submit để gọi API setupPasswordAndRequestOtp
    t
  } = hookProps;

  return (
    <form onSubmit={handleSetupPassword} className="flex flex-col gap-4 animate-in fade-in">
      
      {/* Trường Email (Chỉ đọc - Không cho phép sửa) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
          {t('emailAddress') || 'Email Address'}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Mail size={16} /></span>
          <input 
            type="email" 
            value={email || ''} 
            disabled={true} 
            readOnly
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none opacity-70 cursor-not-allowed bg-black/5 dark:bg-white/5" 
            style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} 
          />
        </div>
        <p className="text-[11px] opacity-60 mt-1" style={{ color: 'var(--ct-text)' }}>
          {t('emailLinkedToInvite') || 'This email is linked to your invitation and cannot be changed.'}
        </p>
      </div>
      
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