import { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck, 
  Building2, GraduationCap, Award, ArrowRight, Clock, XCircle, Key, CheckCircle,
  Smartphone, Shield
} from 'lucide-react';
import { mockAccounts } from '../data/mockData';
import type { AppContextType } from '../App';

type LoginView = 'login' | 'pending' | 'rejected' | 'setup' | 'login_2fa' | 'setup_2fa';

export function Login({ ctx }: { ctx: AppContextType }) {
  const { t, setPage, setRole } = ctx;
  
  // Trạng thái Form & Luồng
  const [view, setView] = useState<LoginView>('login');
  const [currentAcc, setCurrentAcc] = useState<any>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Setup Password State
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSetupPwd, setShowSetupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSetupSuccess, setIsSetupSuccess] = useState(false);

  // 2FA State
  const [otpMethod, setOtpMethod] = useState<'email' | 'sms'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. XỬ LÝ ĐĂNG NHẬP (CHECK CREDENTIALS)
  const processLogin = (userEmail: string, userPwd?: string) => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const account = mockAccounts.find(
        acc => acc.email.toLowerCase() === userEmail.trim().toLowerCase()
      );

      if (account) {
        if (account.status === 'inactive') {
          setError(t('errorAccountInactive') || 'This account is locked.');
        } else if (account.status === 'pending') {
          setCurrentAcc(account);
          setView('pending');
        } else if (account.status === 'rejected') {
          setCurrentAcc(account);
          setView('rejected');
        } else if (account.status === 'setup_required') {
          setCurrentAcc(account);
          setView('setup');
        } else {
          // Trạng thái Active -> Bắt buộc qua bước 2FA
          setCurrentAcc(account);
          setOtpValue('');
          setOtpMethod('email');
          setView('login_2fa');
        }
      } else {
        setError(t('errorInvalidCredentials') || 'Email or password is invalid.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t('errorFieldsRequired') || 'Please fill in all required fields.');
      return;
    }
    processLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    processLogin(demoEmail);
  };

  // 2. XỬ LÝ SETUP MẬT KHẨU
  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSetupAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (setupPassword !== setupConfirm) {
      setError(t('errorPasswordMismatch') || 'Password and Confirm Password do not match.');
      return;
    }
    if (!validatePassword(setupPassword)) {
      setError(t('errorWeakPassword') || 'Password must contain at least 8 characters...');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSetupSuccess(true);
      // Giả lập chuyển hướng sang Setup 2FA bắt buộc
      setTimeout(() => {
        setIsSetupSuccess(false);
        setOtpValue('');
        setOtpMethod('email');
        setView('setup_2fa');
      }, 2000);
    }, 1000);
  };

  // 3. XỬ LÝ XÁC THỰC 2FA (Chung cho Login và Setup)
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 6) return;
    
    setIsOtpLoading(true);
    setOtpError(null);

    // Đợi một khoảng thời gian (1.5s) trước khi chuyển page như yêu cầu
    setTimeout(() => {
      if (otpValue === '000000') {
        setOtpError(t('errorOtpExpired') || 'OTP has expired. Please request a new code.');
        setIsOtpLoading(false);
      } else if (otpValue === '111111') {
        setOtpError(t('errorOtpInvalid') || 'Invalid OTP. Please try again.');
        setIsOtpLoading(false);
      } else {
        // Mọi chuỗi 6 số khác đều coi là hợp lệ và vào Portal
        setRole(currentAcc.type as 'student' | 'issuer' | 'hr' | 'admin');
        setPage(currentAcc.type);
      }
    }, 1500);
  };

  // Helper
  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'admin': return <ShieldCheck size={16} />;
      case 'hr': return <Building2 size={16} />;
      case 'issuer': return <Award size={16} />;
      default: return <GraduationCap size={16} />;
    }
  };

  const renderRegData = (data: any) => (
    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-2 p-4 rounded-xl border text-left" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
      <div className="col-span-2 flex justify-between border-b pb-2 mb-1" style={{ borderColor: 'var(--ct-border)' }}>
        <span className="opacity-60">{t('submittedAt') || 'Submitted At'}:</span>
        <span className="font-mono">{new Date(data.submittedAt).toLocaleString()}</span>
      </div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblOrgName') || 'Organization'}:</span><span className="font-medium">{data.orgName}</span></div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblTaxCode') || 'Tax Code'}:</span><span className="font-medium">{data.taxCode}</span></div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblRegName') || 'Registrant'}:</span><span className="font-medium">{data.regName}</span></div>
      <div><span className="opacity-60 block text-xs mb-0.5">{t('lblContactPhone') || 'Phone'}:</span><span className="font-medium">{data.contactPhone}</span></div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 animate-in fade-in duration-500" style={{ background: 'var(--ct-bg)' }}>
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* =======================================
            VIEW 1: FORM LOGIN CHÍNH
        ======================================= */}
        {view === 'login' && (
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

            {/* Quick Demo Panel */}
            <div className="p-6 rounded-2xl border flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80" style={{ color: 'var(--ct-text)' }}>{t('demoAccounts') || 'Demo Accounts'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mockAccounts.filter(acc => ['acc_001', 'acc_002', 'iss_001', 'iss_002', 'iss_003', 'hr_001', 'hr_002', 'hr_003'].includes(acc.id)).map((acc) => (
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
        )}

        {/* =======================================
            VIEW 2, 3: PENDING & REJECTED
        ======================================= */}
        {view === 'pending' && currentAcc?.registrationData && (
          <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 text-center animate-in zoom-in-95" style={{ borderColor: '#3b82f6', background: 'var(--ct-surface)' }}>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Clock size={32} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--ct-text)' }}>{t('pendingReviewTitle') || 'Application Under Review'}</h2>
              <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>{t('pendingReviewDesc') || 'Your registration is currently pending review by an administrator.'}</p>
            </div>
            {renderRegData(currentAcc.registrationData)}
            <button onClick={() => setView('login')} className="mt-2 w-full py-3 text-sm font-semibold rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
              {t('backToLogin') || 'Back to Login'}
            </button>
          </div>
        )}

        {view === 'rejected' && currentAcc?.registrationData && (
          <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 text-center animate-in zoom-in-95" style={{ borderColor: '#ef4444', background: 'var(--ct-surface)' }}>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <XCircle size={32} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--ct-text)' }}>{t('rejectedTitle') || 'Application Rejected'}</h2>
              <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>{t('rejectedDesc') || 'Unfortunately, your registration has been rejected. Thank you for your interest.'}</p>
            </div>
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm text-left dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-300">
              <span className="font-semibold block mb-1">{t('rejectionReason') || 'Reason for rejection'}:</span>
              {currentAcc.registrationData.rejectedReason}
            </div>
            {renderRegData(currentAcc.registrationData)}
            <button onClick={() => setPage('landing')} className="mt-2 w-full py-3 text-sm font-semibold rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
              {t('backToHome') || 'Back to Landing Page'}
            </button>
          </div>
        )}

        {/* =======================================
            VIEW 4: SETUP PASSWORD (APPROVED)
        ======================================= */}
        {view === 'setup' && (
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
        )}

        {/* =======================================
            VIEW 5: 2FA LOGIN & SETUP
        ======================================= */}
        {(view === 'login_2fa' || view === 'setup_2fa') && (
          <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 animate-in zoom-in-95" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
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

            {/* Hint Box */}
            {otpError && (
              <div className="p-3 rounded-xl border flex items-center gap-2 text-sm animate-in shake" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
                <AlertCircle size={16} /><span>{otpError}</span>
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

              <div className="flex flex-col items-center gap-3 mt-2">
                <button 
                  type="button" 
                  disabled={isOtpLoading}
                  onClick={() => { setOtpMethod(otpMethod === 'email' ? 'sms' : 'email'); setOtpValue(''); setOtpError(null); }}
                  className="text-xs font-semibold hover:underline flex items-center gap-1.5 transition-all disabled:opacity-40"
                  style={{ color: 'var(--ct-text)' }}
                >
                  {otpMethod === 'email' ? <Smartphone size={14} /> : <Mail size={14} />}
                  {otpMethod === 'email' ? (t('switchToSMS') || 'Switch to SMS method') : (t('switchToEmail') || 'Switch to Email method')}
                </button>

                <button 
                  type="button" 
                  disabled={isOtpLoading}
                  onClick={() => { setOtpValue(''); setOtpError(null); }}
                  className="text-xs opacity-60 hover:opacity-100 hover:underline transition-all disabled:opacity-40"
                  style={{ color: 'var(--ct-text)' }}
                >
                  {t('resendOTP') || 'Didn\'t receive a code? Resend'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}