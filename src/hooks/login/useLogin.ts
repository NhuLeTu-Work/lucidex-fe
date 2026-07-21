import { useApp } from '../../app/AppContext';
import { useNavigate } from 'react-router-dom';

import { useLoginState } from './useLoginState';
import { useLoginActions } from './useLoginActions';
import { useSetupAccount } from './useSetupAccount';
import { useLoginOtp } from './useLoginOtp';

export function useLogin() {
  const { t, setRole } = useApp();
  const navigate = useNavigate();

  // Khởi tạo trạng thái
  const state = useLoginState();

  // Khởi tạo các logic handlers
  const { processLogin, handleLogin, handleQuickLogin } = useLoginActions(state, t);
  const { handleSetupAccount } = useSetupAccount(state);
  const { handleVerify2FA, handleResendOTP, handleSwitchMethod } = useLoginOtp(state, t, setRole, navigate);

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
    handleVerify2FA,
    t,
    resendCountdown: state.resendCountdown,
    isSwitchDisabled: state.isSwitchDisabled,
    otpSuccessMessage: state.otpSuccessMessage,
    handleResendOTP,
    handleSwitchMethod,
    tempOtpToken: state.tempOtpToken,
    processLogin,
    setupToken: state.setupToken,
    challengeToken: state.challengeToken,
    qrCode: state.qrCode,
    manualEntryKey: state.manualEntryKey,
  };
}