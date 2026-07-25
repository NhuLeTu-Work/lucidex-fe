import { useApp } from '../../app/AppContext';
import { useNavigate } from 'react-router-dom';

import { useLoginState } from './useLoginState';
import { useLoginActions } from './useLoginActions';
import { useSetupAccount } from './useSetupAccount';
import { useLoginOtp } from './useLoginOtp';
import { useResendOtp } from '../auth/useResendOtp';

export function useLogin() {
  const { t, setRole } = useApp();
  const navigate = useNavigate();
  const state = useLoginState();

  const {
    isResendOtpLoading,
    resendCountdown,
    resendMessage,
    triggerResend,
    isSwitchDisabled,
    handleSwitchMethod,
  } = useResendOtp({ setOtpMethod: state.setOtpMethod, setOtpValue: state.setOtpValue });

  const handleResendOTP = () => {
    const targetEmail = state.currentAcc?.email || state.email;
    triggerResend({ email: targetEmail }, state.setOtpError);
  };

  const { processLogin, handleLogin, handleQuickLogin, handleGoogleAuth} = useLoginActions(state, navigate, setRole);
  const { handleSetupAccount } = useSetupAccount(state);
  
  const { handle2FALogin } = useLoginOtp(state, setRole, navigate);

  return {
    view: state.view,
    setView: state.setView,
    currentAcc: state.currentAcc,
    email: state.email,
    setEmail: state.setEmail,
    password: state.password,
    setPassword: state.setPassword,
    setupPassword: state.setupPassword,
    setSetupPassword: state.setSetupPassword,
    setupConfirm: state.setupConfirm,
    setSetupConfirm: state.setSetupConfirm,
    showPassword: state.showPassword,
    setShowPassword: state.setShowPassword,
    showSetupPwd: state.showSetupPwd,
    setShowSetupPwd: state.setShowSetupPwd,
    showConfirmPwd: state.showConfirmPwd,
    setShowConfirmPwd: state.setShowConfirmPwd,
    isSetupSuccess: state.isSetupSuccess,
    
    otpMethod: state.otpMethod,
    setOtpMethod: state.setOtpMethod,
    otpValue: state.otpValue,
    setOtpValue: state.setOtpValue,
    otpError: state.otpError,
    setOtpError: state.setOtpError,
    isOtpLoading: state.isOtpLoading,
    
    error: state.error,
    isLoading: state.isLoading,
    
    handleLogin,
    handleQuickLogin,
    handleSetupAccount,
    handle2FALogin,
    handleGoogleAuth,
    t,

    isResendOtpLoading,
    resendCountdown,
    resendMessage,
    handleResendOTP,
    isSwitchDisabled, handleSwitchMethod,

    tempOtpToken: state.tempOtpToken,
    processLogin,
    setupToken: state.setupToken,
    challengeToken: state.challengeToken,
    qrCode: state.qrCode,
    manualEntryKey: state.manualEntryKey,
  };
}