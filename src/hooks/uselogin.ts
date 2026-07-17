import { useState, useRef, useEffect } from 'react';
import { mockAccounts } from '../data/mockData';
import type { Account } from '../data/mockData';
import { useApp } from '../app/AppContext';
import { useNavigate } from 'react-router-dom';
import type { LoginView, OtpMethod } from '../types/login';

export function useLogin() {
  const { t, setRole } = useApp();
  const navigate = useNavigate();
  
  const [view, setView] = useState<LoginView>('login');
  const [currentAcc, setCurrentAcc] = useState<Account | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSetupPwd, setShowSetupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSetupSuccess, setIsSetupSuccess] = useState(false);

  const [otpMethod, setOtpMethod] = useState<OtpMethod>('email');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const switchTimestamps = useRef<number[]>([]); // lưu thời điểm các lần switch
  const resendTimestamps = useRef<number[]>([]); // lưu thời điểm các lần resend

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown(c => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const processLogin = (loginIdentifier: string, userPwd?: string) => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const account = mockAccounts.find(acc => 
        acc.email.toLowerCase() === loginIdentifier.trim().toLowerCase() ||
        (acc.username && acc.username.toLowerCase() === loginIdentifier.trim().toLowerCase())
      );
      if (account) {
        if (account.status === 'inactive') {
          setError('errorAccountInactive');
        } else if (account.status === 'pending') {
          setCurrentAcc(account);
          setView('pending');
        } else if (account.status === 'rejected') {
          setCurrentAcc(account);
          setView('rejected');
        } else if (account.status === 'setup_required') {
          setCurrentAcc(account);
          setView('setup');
        } else if (account.type === 'admin') {
          setCurrentAcc(account);
          setOtpValue('');
          setView(account.has2FA ? 'login_2fa' : 'setup_2fa'); 
        }else {
          setCurrentAcc(account);
          setOtpValue('');
          setOtpMethod('email');
          setView('login_2fa');
        }
      } else {
        setError('errorInvalidCredentials');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('errorFieldsRequired');
      return;
    }
    processLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    processLogin(demoEmail);
  };

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSetupAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (setupPassword !== setupConfirm) {
      setError('errorPasswordMismatch');
      return;
    }
    if (!validatePassword(setupPassword)) {
      setError('errorWeakPassword');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSetupSuccess(true);
      setTimeout(() => {
        setIsSetupSuccess(false);
        setOtpValue('');
        setOtpMethod('email');
        setView('setup_2fa');
      }, 2000);
    }, 1000);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAcc?.type === 'admin') {
      if (otpValue === '676767') {
        setRole('admin');
        navigate('/admin');
      } else {
        setOtpError('errorTotpInvalid');
      }
      setIsOtpLoading(false);
    } else {
      if (otpValue.length < 6) return;
      
      setIsOtpLoading(true);
      setOtpError(null);
      
      setTimeout(() => {
        if (otpValue === '000000') {
          setOtpError('errorOtpExpired');
          setIsOtpLoading(false);
        } else if (otpValue === '111111') {
          setOtpError('errorOtpInvalid');
          setIsOtpLoading(false);
        } else if (currentAcc) {
          setRole(currentAcc.type as 'owner' | 'issuer' | 'verifier' | 'admin');
          navigate(`/${currentAcc.type}`);
        }
      }, 1500);
    }
  };

  const handleResendOTP = () => {
    const now = Date.now();
    resendTimestamps.current = resendTimestamps.current.filter(ts => now - ts < 5 * 60 * 1000);

    if (resendTimestamps.current.length >= 3) {
      setOtpSuccessMessage('');
      setOtpError('errorTooManyAttempts');
      return;
    }

    resendTimestamps.current.push(now);
    setOtpError(null);
    setOtpSuccessMessage('otpResent');
    setResendCountdown(60);
  };

  const handleSwitchMethod = (newMethod: 'email' | 'sms') => {
    const now = Date.now();
    switchTimestamps.current = switchTimestamps.current.filter(ts => now - ts < 10 * 1000);

    if (switchTimestamps.current.length >= 3) {
      setIsSwitchDisabled(true);
      setOtpSuccessMessage('');
      setOtpError('errorSwitchCooldown');
      setTimeout(() => { setIsSwitchDisabled(false); setOtpError(null); }, 10 * 1000);
      return;
    }

    switchTimestamps.current.push(now);
    setOtpMethod(newMethod);
    setOtpValue('');
    setOtpError(null);
    setOtpSuccessMessage('otpResent');
    setResendCountdown(60); // switch cũng reset countdown Resend
  };

  return {
    view, setView, currentAcc, email, setEmail, password, setPassword,
    setupPassword, setSetupPassword, setupConfirm, setSetupConfirm,
    showPassword, setShowPassword, showSetupPwd, setShowSetupPwd,
    showConfirmPwd, setShowConfirmPwd, isSetupSuccess, otpMethod, setOtpMethod,
    otpValue, setOtpValue, otpError, setOtpError, isOtpLoading, error, isLoading,
    handleLogin, handleQuickLogin, handleSetupAccount, handleVerify2FA, t,
    resendCountdown, isSwitchDisabled, otpSuccessMessage, handleResendOTP, handleSwitchMethod
  };
}