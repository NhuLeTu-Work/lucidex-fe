import { useApp } from '../../app/AppContext';
import { useNavigate } from 'react-router-dom';

import { useLoginState } from './useLoginState';
import { useLoginActions } from './useLoginActions';
import { useSetupAccount } from './useSetupAccount';
import { useLoginOtp } from './useLoginOtp';
import { useResendOtp } from '../business/usehandleResendOtp';

export function useLogin() {
  const { t, setRole } = useApp();
  const navigate = useNavigate();

  // Khởi tạo trạng thái
  const state = useLoginState();

  // ==============================================
  // TÍCH HỢP HOOK RESEND OTP MỚI
  // ==============================================
  const { 
    isResendOtpLoading, 
    resendCountdown, 
    resendMessage, 
    triggerResend 
  } = useResendOtp(t);

  // Tạo hàm handleResendOTP mới dùng chung
  const handleResendOTP = () => {
    // Luồng Login: Ưu tiên lấy email từ tài khoản đang đăng nhập (currentAcc)
    const targetEmail = state.currentAcc?.email || state.email;
    
    // Gọi hàm trigger từ hook, truyền email và hàm setOtpError của state hiện tại
    triggerResend(targetEmail, state.setOtpError);
  };
  // ==============================================

  // Khởi tạo các logic handlers
  const { processLogin, handleLogin, handleQuickLogin } = useLoginActions(state, t);
  const { handleSetupAccount } = useSetupAccount(state);
  
  // Lưu ý: Mình không lấy handleResendOTP từ useLoginOtp cũ nữa, chỉ lấy verify và switch
  const { handleVerify2FA, handleSwitchMethod } = useLoginOtp(state, t, setRole, navigate);

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

    // 👇 CÁC BIẾN EXPORT MỚI TỪ USE_RESEND_OTP 👇
    isResendOtpLoading,
    resendCountdown,
    resendMessage,
    handleResendOTP,

    isSwitchDisabled: state.isSwitchDisabled,
    handleSwitchMethod,
    tempOtpToken: state.tempOtpToken,
    processLogin,
    setupToken: state.setupToken,
    challengeToken: state.challengeToken,
    qrCode: state.qrCode,
    manualEntryKey: state.manualEntryKey,
  };
}