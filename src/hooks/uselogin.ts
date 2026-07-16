import { useState } from 'react';
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

  const processLogin = (userEmail: string, userPwd?: string) => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const account = mockAccounts.find(
        acc => acc.email.toLowerCase() === userEmail.trim().toLowerCase()
      ) as Account | undefined;

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
    if (otpValue.length < 6) return;
    
    setIsOtpLoading(true);
    setOtpError(null);

    setTimeout(() => {
      if (otpValue === '000000') {
        setOtpError(t('errorOtpExpired') || 'OTP has expired. Please request a new code.');
        setIsOtpLoading(false);
      } else if (otpValue === '111111') {
        setOtpError(t('errorOtpInvalid') || 'Invalid OTP. Please try again.');
        setIsOtpLoading(false);
      } else if (currentAcc) {
        setRole(currentAcc.type as 'owner' | 'issuer' | 'verifier' | 'admin');
        navigate(`/${currentAcc.type}`);
      }
    }, 1500);
  };

  return {
    view, setView, currentAcc, email, setEmail, password, setPassword,
    setupPassword, setSetupPassword, setupConfirm, setSetupConfirm,
    showPassword, setShowPassword, showSetupPwd, setShowSetupPwd,
    showConfirmPwd, setShowConfirmPwd, isSetupSuccess, otpMethod, setOtpMethod,
    otpValue, setOtpValue, otpError, setOtpError, isOtpLoading, error, isLoading,
    handleLogin, handleQuickLogin, handleSetupAccount, handleVerify2FA, t
  };
}