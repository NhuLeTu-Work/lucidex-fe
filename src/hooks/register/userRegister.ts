import { useApp } from '@/app/AppContext';
import { useNavigate } from 'react-router-dom';
import type { RegistrationRole } from './types';

// Các sub-hooks đã tách
import { useRegisterState } from './useRegisterState';
import { usePasswordValidation } from './usePasswordValidation';
import { useOtp } from './useOtp';
import { useOwnerRegister } from './useOwnerRegister';
import { useBusinessRegister } from './useBusinessRegister';
import { useOwnerRegisterOtp } from './useOwnerRegisterOtp';

export function useRegister() {
  const { t, setRole } = useApp();
  const navigate = useNavigate();

  // Khởi tạo states
  const state = useRegisterState();
  const { validatePassword } = usePasswordValidation();

  // Khởi tạo các handlers
  const { handleVerifyOTP, handleResendOTP } = useOtp(state, t, setRole, navigate);
  const { handleOwnerRegister, handleGoogleRegister } = useOwnerRegister(state, validatePassword, t, setRole, navigate);
  const { handleBizChange, handleBizRegister } = useBusinessRegister(state, t);
  const { handleOwnerRegisterOtp } = useOwnerRegisterOtp(state, t, navigate);

  // Các hàm tiện ích bổ sung
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    state.setRoleType(e.target.value as RegistrationRole);
    state.setError(null);
    state.setFieldErrors({});
    state.setIsSuccess(false);
  };

  const getSubtitle = () => {
    switch(state.roleType) {
      case 'issuer': return t('subtitleIssuer');
      case 'verifier': return t('subtitleVerifier');
      default: return t('subtitleOwner');
    }
  };

  // Trả về exacly 100% properties và types giống hệt file gốc
  return {
    roleType: state.roleType,
    handleRoleChange,
    error: state.error,
    missingFieldKeys: state.missingFieldKeys,
    fieldErrors: state.fieldErrors,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    
    email: state.email,
    setEmail: state.setEmail,
    password: state.password,
    setPassword: state.setPassword,
    confirmPassword: state.confirmPassword,
    setConfirmPassword: state.setConfirmPassword,
    
    showPassword: state.showPassword,
    setShowPassword: state.setShowPassword,
    showConfirmPassword: state.showConfirmPassword,
    setShowConfirmPassword: state.setShowConfirmPassword,
    
    bizData: state.bizData,
    certificate: state.certificate,
    setCertificate: state.setCertificate,
    handleBizChange,
    handleBizRegister,
    
    showOtpModal: state.showOtpModal,
    setShowOtpModal: state.setShowOtpModal,
    otpValue: state.otpValue,
    setOtpValue: state.setOtpValue,
    otpError: state.otpError,
    setOtpError: state.setOtpError,
    isOtpLoading: state.isOtpLoading,
    
    handleOwnerRegisterOtp,
    handleOwnerRegister,
    handleGoogleRegister,
    handleVerifyOTP,
    getSubtitle,
    t,
    setRole,
    
    isResendOtpLoading: state.isResendOtpLoading,
    resendMessage: state.resendMessage,
    handleResendOTP,
    resendCountdown: state.resendCountdown
  };
}