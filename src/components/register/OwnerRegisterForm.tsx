import { Mail, Lock, EyeOff, Eye, ShieldAlert, UserPlus, User } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export function OwnerRegisterForm({ hookProps }: { hookProps: any }) {
  const {
    fullName, setFullName, // Thêm state fullName
    email, setEmail, password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    isLoading, handleOwnerRegister, handleGoogleAuth,
    t
  } = hookProps;

  return (
    <form onSubmit={handleOwnerRegister} className="flex flex-col gap-4 animate-in fade-in">
      {/* Trường Full Name Mới Thêm */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
          {t('fullName') || 'Full Name'}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}>
            <User size={16} />
          </span>
          <input 
            type="text" 
            value={fullName} 
            disabled={isLoading} 
            // Có thể chặn nhập số/ký tự đặc biệt ngay khi type hoặc để hiển thị lỗi sau khi submit
            onChange={e => setFullName(e.target.value)} 
            placeholder="John Doe" 
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" 
            style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} 
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
          {t('emailAddress') || 'Email Address'}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Mail size={16} /></span>
          <input 
            type="email" 
            value={email} 
            disabled={isLoading} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="name@example.com" 
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 disabled:opacity-50" 
            style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} 
          />
        </div>
      </div>
      
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
      
      <button type="submit" disabled={isLoading} className="w-full mt-2 py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
        {isLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><UserPlus size={16} /><span>{t('signUp') || 'Sign Up'}</span></>}
      </button>

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
            console.log('Register Failed');
          }}
          text="signup_with" // Tùy chỉnh text của nút thành "Sign up with Google"
        />
      </div>
    </form>
  );
}