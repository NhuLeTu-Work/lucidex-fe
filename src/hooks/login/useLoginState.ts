import { useState, useRef, useEffect } from 'react';
import type { Account, LoginView, OtpMethod } from './types';

export function useLoginState() {
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
  
  const switchTimestamps = useRef<number[]>([]);
  const resendTimestamps = useRef<number[]>([]);
  
  const [tempOtpToken, setTempOtpToken] = useState<string | null>(null);
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualEntryKey, setManualEntryKey] = useState<string | null>(null);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown(c => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  return {
    view, setView,
    currentAcc, setCurrentAcc,
    email, setEmail,
    password, setPassword,
    setupPassword, setSetupPassword,
    setupConfirm, setSetupConfirm,
    showPassword, setShowPassword,
    showSetupPwd, setShowSetupPwd,
    showConfirmPwd, setShowConfirmPwd,
    isSetupSuccess, setIsSetupSuccess,
    otpMethod, setOtpMethod,
    otpValue, setOtpValue,
    otpError, setOtpError,
    isOtpLoading, setIsOtpLoading,
    error, setError,
    isLoading, setIsLoading,
    resendCountdown, setResendCountdown,
    isSwitchDisabled, setIsSwitchDisabled,
    otpSuccessMessage, setOtpSuccessMessage,
    switchTimestamps, resendTimestamps,
    tempOtpToken, setTempOtpToken,
    setupToken, setSetupToken,
    challengeToken, setChallengeToken,
    qrCode, setQrCode,
    manualEntryKey, setManualEntryKey
  };
}