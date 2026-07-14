import { useState, useRef } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, X, CheckCircle, ShieldAlert,
  ChevronDown, Building2, Hash, MapPin, User, Phone, Briefcase, Upload, ShieldCheck
} from 'lucide-react';
import { mockAccounts } from '../data/mockData';
import type { AppContextType } from '../App';

type RegistrationRole = 'student' | 'issuer' | 'hr';

export function Register({ ctx }: { ctx: AppContextType }) {
  const { t, setPage, setRole } = ctx;
  
  // Trạng thái chung
  const [roleType, setRoleType] = useState<RegistrationRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Dành riêng cho luồng Issuer/Verifier
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái Form Credential Owner (Student)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Trạng thái Form Issuer / Verifier
  const [bizData, setBizData] = useState({
    orgName: '',
    taxCode: '',
    address: '',
    legalRep: '',
    email: '',
    phone: '',
    regName: '',
    regTitle: '',
  });
  const [certificate, setCertificate] = useState<File | null>(null);

  // Trạng thái OTP Modal (Student)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Handle Switch Role
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleType(e.target.value as RegistrationRole);
    setError(null);
    setFieldErrors({});
    setIsSuccess(false);
  };

  // ==========================================
  // LUỒNG 1: CREDENTIAL OWNER
  // ==========================================
  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(pwd);
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('errorFieldsRequired') || 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch') || 'Password and Confirm Password do not match.');
      return;
    }
    if (!validatePassword(password)) {
      setError(t('errorWeakPassword') || 'Password must contain at least 8 characters...');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const emailExists = mockAccounts.some(acc => acc.email.toLowerCase() === email.trim().toLowerCase());
      if (emailExists) {
        setError(t('errorEmailExists') || 'This email is already registered.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setShowOtpModal(true);
      setOtpValue('');
      setOtpError(null);
    }, 800);
  };

  const handleVerifyOTP = () => {
    if (!otpValue.trim()) return;
    setOtpError(null);
    setIsOtpLoading(true);
    setTimeout(() => {
      if (otpValue === '123456') {
        setRole('student');
        setPage('student');
      } else if (otpValue === '000000') {
        setOtpError(t('errorOtpExpired') || 'OTP has expired.');
      } else {
        setOtpError(t('errorOtpInvalid') || 'Invalid OTP.');
      }
      setIsOtpLoading(false);
    }, 800);
  };

  // ==========================================
  // LUỒNG 2: ISSUER & VERIFIER
  // ==========================================
  const handleBizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBizData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear validation error for field when typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleBizRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const missingFields: string[] = [];
    const requiredKeys = roleType === 'hr' 
      ? ['orgName', 'taxCode', 'address', 'legalRep', 'email', 'phone', 'regName', 'regTitle', 'certificate']
      : ['orgName', 'taxCode', 'address', 'legalRep', 'email', 'phone', 'regName'];

    // 1. Check Missing Fields
    requiredKeys.forEach(key => {
      if (key === 'certificate') {
        if (!certificate) missingFields.push(t('uploadCert') || 'Business registration certificate');
      } else {
        if (!bizData[key as keyof typeof bizData].trim()) {
          const fieldLabelMap: Record<string, string> = {
            orgName: roleType === 'hr' ? 'lblOrgName' : 'lblInstName',
            taxCode: 'lblTaxCode',
            address: 'lblAddress',
            legalRep: 'lblLegalRep',
            email: 'lblContactGmail',
            phone: 'lblContactPhone',
            regName: 'lblRegName',
            regTitle: 'lblRegTitle',
          };
          missingFields.push(t(fieldLabelMap[key]) || key);
        }
      }
    });

    if (missingFields.length > 0) {
      setError(`${t('errorMissingFields') || 'Please fill in the following required field(s):'} ${missingFields.join(', ')}.`);
      return;
    }

    // 2. Validate Formats
    const fErrors: Record<string, string> = {};
    
    if (bizData.orgName.length < 3 || bizData.orgName.length > 200) {
      fErrors.orgName = t('fmtTextLength') || 'Text, 3–200 characters';
    }
    if (!/^\d{10}$/.test(bizData.taxCode)) {
      fErrors.taxCode = t('fmtTaxCode') || 'Exactly 10 digits';
    }
    if (!/^[\p{L}\s]+$/u.test(bizData.legalRep)) {
      fErrors.legalRep = t('fmtLettersOnly') || 'Text, letters only';
    }
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(bizData.email)) {
      fErrors.email = t('fmtGmail') || 'Valid email format (e.g. name@gmail.com)';
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(bizData.phone)) {
      fErrors.phone = t('fmtPhone') || '10-digit Vietnamese phone number';
    }
    if (!/^[\p{L}\s]+$/u.test(bizData.regName)) {
      fErrors.regName = t('fmtLettersOnly') || 'Text, letters only';
    }

    if (Object.keys(fErrors).length > 0) {
      setFieldErrors(fErrors);
      return;
    }

    // 3. Submit
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  // Helper để lấy Subtitle
  const getSubtitle = () => {
    switch(roleType) {
      case 'issuer': return t('subtitleIssuer') || 'Register your institution to start issuing digital credentials.';
      case 'hr': return t('subtitleVerifier') || 'Register your organization to verify credentials seamlessly.';
      default: return t('subtitleOwner') || 'Join us to securely manage your credentials.';
    }
  };

  // Helper Render Field cho Business Form
  const renderBizField = (name: string, labelKey: string, Icon: React.ElementType, placeholder: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
        {t(labelKey) || placeholder}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 opacity-40" style={{ color: 'var(--ct-text)' }}><Icon size={16} /></span>
        <input
          name={name}
          value={bizData[name as keyof typeof bizData]}
          onChange={handleBizChange}
          disabled={isLoading}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all disabled:opacity-50 ${fieldErrors[name] ? 'border-red-500 focus:border-red-500' : 'focus:border-neutral-400'}`}
          style={{ background: 'var(--ct-bg)', borderColor: fieldErrors[name] ? '#ef4444' : 'var(--ct-border)', color: 'var(--ct-text)' }}
        />
      </div>
      {fieldErrors[name] && <span className="text-[11px] text-red-500 font-medium ml-1 animate-in slide-in-from-top-1">{fieldErrors[name]}</span>}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 animate-in fade-in duration-500" style={{ background: 'var(--ct-bg)' }}>
      <div className={`w-full flex flex-col gap-6 transition-all ${roleType === 'student' ? 'max-w-md' : 'max-w-2xl'}`}>
        
        <div className="p-8 rounded-2xl border shadow-xl flex flex-col gap-6 transition-all" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-surface)' }}>
          
          {/* Header & Dropdown */}
          <div className="text-center flex flex-col gap-3">
            <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center border mb-1" style={{ borderColor: 'var(--ct-border)', background: 'var(--ct-bg)' }}>
              <UserPlus size={22} style={{ color: 'var(--ct-text)' }} />
            </div>
            
            <h2 className="font-display text-2xl font-semibold tracking-tight" style={{ color: 'var(--ct-text)' }}>
              {t('createAccountTitle') || 'Create an Account'}
            </h2>

            {/* Role Dropdown */}
            <div className="relative w-48 mx-auto">
              <select
                value={roleType}
                onChange={handleRoleChange}
                disabled={isSuccess}
                className="w-full appearance-none px-4 py-2 text-sm font-semibold rounded-lg border outline-none cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
              >
                <option value="student">{t('roleOwner') || 'Credential Owner'}</option>
                <option value="issuer">{t('roleIssuer') || 'Issuer'}</option>
                <option value="hr">{t('roleVerifier') || 'Verifier'}</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 opacity-50 pointer-events-none" size={16} style={{ color: 'var(--ct-text)' }}/>
            </div>

            <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>
              {getSubtitle()}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl border flex items-start gap-2.5 text-sm animate-in shake duration-300" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium text-balance">{error}</span>
            </div>
          )}

          {/* ==================================
              FORM 1: CREDENTIAL OWNER 
          ================================== */}
          {roleType === 'student' && (
            <form onSubmit={handleStudentRegister} className="flex flex-col gap-4 animate-in fade-in">
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

              <button type="button" disabled={isLoading} onClick={() => { setIsLoading(true); setTimeout(() => { setRole('student'); setPage('student'); }, 1000); }} className="w-full py-2.5 text-sm font-semibold rounded-xl border shadow-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50" style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)', background: 'var(--ct-surface)' }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                <span>{t('signUpWithGoogle') || 'Sign up with Google Account'}</span>
              </button>
            </form>
          )}

          {/* ==================================
              FORM 2: ISSUER / VERIFIER
          ================================== */}
          {(roleType === 'issuer' || roleType === 'hr') && !isSuccess && (
            <form onSubmit={handleBizRegister} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderBizField('orgName', roleType === 'hr' ? 'lblOrgName' : 'lblInstName', Building2, 'FPT Software / CTU')}
                {renderBizField('taxCode', 'lblTaxCode', Hash, '1234567890')}
                {renderBizField('address', 'lblAddress', MapPin, '123 Example St, City')}
                {renderBizField('legalRep', 'lblLegalRep', User, 'Nguyen Van A')}
                {renderBizField('email', 'lblContactGmail', Mail, 'contact@gmail.com')}
                {renderBizField('phone', 'lblContactPhone', Phone, '0987654321')}
                {renderBizField('regName', 'lblRegName', User, 'Tran Thi B')}
                {roleType === 'hr' && renderBizField('regTitle', 'lblRegTitle', Briefcase, 'HR Manager')}
              </div>

              {/* Upload Certificate cho Verifier */}
              {roleType === 'hr' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-70" style={{ color: 'var(--ct-text)' }}>
                    {t('uploadCert') || 'Business registration certificate'}
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 ${fieldErrors['certificate'] ? 'border-red-500 bg-red-50/10' : ''}`}
                    style={{ borderColor: fieldErrors['certificate'] ? '#ef4444' : 'var(--ct-border)' }}
                  >
                    <Upload size={24} className="opacity-40" style={{ color: 'var(--ct-text)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--ct-text)' }}>
                      {certificate ? certificate.name : (t('clickToUpload') || 'Click to upload certificate')}
                    </span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCertificate(e.target.files[0]);
                          if (fieldErrors['certificate']) setFieldErrors(prev => ({ ...prev, certificate: '' }));
                        }
                      }}
                    />
                  </div>
                  {fieldErrors['certificate'] && <span className="text-[11px] text-red-500 font-medium ml-1">{fieldErrors['certificate']}</span>}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
                {isLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><ShieldCheck size={16} /><span>{t('submitForReview') || 'Submit Application'}</span></>}
              </button>
            </form>
          )}

          {/* ==================================
              TRẠNG THÁI SUCCESS (ISSUER/VERIFIER)
          ================================== */}
          {(roleType === 'issuer' || roleType === 'hr') && isSuccess && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in zoom-in-95 duration-500 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                <CheckCircle size={32} className="text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-xl font-display font-semibold" style={{ color: 'var(--ct-text)' }}>
                {t('applicationSubmitted') || 'Application Submitted'}
              </h3>
              <p className="text-sm opacity-80 max-w-sm" style={{ color: 'var(--ct-text)' }}>
                {t('pendingReviewMsg') || 'Your registration application has been submitted successfully and is pending review.'}
              </p>
              <button 
                onClick={() => setPage('landing')} 
                className="mt-4 px-6 py-2 text-sm font-semibold rounded-lg border transition-all hover:opacity-70"
                style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
              >
                {t('returnHome') || 'Return to Home'}
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="pt-2 text-center text-sm flex items-center justify-center gap-1.5" style={{ color: 'var(--ct-text)' }}>
            <span className="opacity-70">{t('alreadyHaveAccount') || 'Already have an account?'}</span>
            <button type="button" onClick={() => setPage('login')} className="font-semibold hover:underline opacity-100">
              {t('signIn') || 'Sign In'}
            </button>
          </div>

        </div>
      </div>

      {/* OTP Modal (Chỉ dành cho Student) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl border p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col gap-6" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--ct-text)' }}>
                  {t('verifyEmail') || 'Verify your email'}
                </h3>
                <p className="text-sm opacity-70" style={{ color: 'var(--ct-text)' }}>
                  {t('otpSentDesc') || `We've sent a 6-digit code to`} <span className="font-semibold opacity-100">{email}</span>
                </p>
              </div>
              <button onClick={() => setShowOtpModal(false)} className="p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity" style={{ color: 'var(--ct-text)' }}><X size={20} /></button>
            </div>

            {/* OTP Mock Hint */}
            <div className="p-3 rounded-lg text-center font-mono text-sm tracking-widest border" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
              123456 <span className="tracking-normal font-sans text-xs opacity-50 ml-2">(Valid)</span> | 000000 <span className="tracking-normal font-sans text-xs opacity-50 ml-2">(Expired)</span>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl border flex items-center gap-2 text-sm animate-in shake" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
                <AlertCircle size={16} /><span>{otpError}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <input type="text" value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/[^0-9]/g, ''))} placeholder="000000" maxLength={6} disabled={isOtpLoading} className="w-full px-4 py-3 rounded-xl border text-xl text-center font-mono tracking-[0.5em] outline-none focus:border-neutral-400 transition-all disabled:opacity-50" style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }} />
              <button onClick={handleVerifyOTP} disabled={isOtpLoading || otpValue.length < 6} className="w-full py-3 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>
                {isOtpLoading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><CheckCircle size={16} />{t('verifyAndProceed') || 'Verify & Proceed'}</>}
              </button>
              <button type="button" disabled={isOtpLoading} onClick={() => { setOtpValue(''); setOtpError(null); }} className="w-full mt-1 py-2 text-xs opacity-70 hover:opacity-100 hover:underline transition-all disabled:opacity-40" style={{ color: 'var(--ct-text)' }}>
                {t('resendOTP') || 'Didn\'t receive a code? Resend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}