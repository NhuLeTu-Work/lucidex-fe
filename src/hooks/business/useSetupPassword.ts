import { useState } from 'react';
import { setupPasswordAndRequestOtp, verifyInviteOtp } from '@/api/endpoints/business/setupPasswordApi';
import type { OrgType } from '@/api/types/business.types';
import { useNavigate } from 'react-router';

export function useSetupPassword(inviteToken: string, orgType: OrgType, emailUrl: string = '', onSuccess: () => void) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // BỔ SUNG: State để quản lý trạng thái Link Invite hỏng/hết hạn
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  
  // State xử lý riêng cho OTP
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [email] = useState<string>(emailUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('errorPasswordMismatch');
      return;
    }

    if (password.length < 8) {
      setError('errorWeakPassword');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        invite_token: inviteToken,
        password: password,
        confirm_password: confirmPassword,
      };

      const response = await setupPasswordAndRequestOtp(orgType, payload);

      if (response.success) {
        setIsSuccess(true);
        onSuccess(); // Mở Modal OTP
      } else {
        setError('errorServer');
      }
    } catch (err: any) {
      // Dùng optional chaining để tránh lỗi crash app nếu không có response
      const status = err.response?.status;
      const errorCode = err.response?.data?.error_code || err.response?.data.error_code;

      if (status === 400 && errorCode === 'INVALID_INVITE') {
        // Thay vì set Error message, ta bật cờ isLinkInvalid để render UI riêng
        setIsLinkInvalid(true);
      } else if (status === 400 && errorCode === 'ACCOUNT_NOT_ELIGIBLE') {
        setError('errorOrgNotFound');
      } else if (status === 400 && errorCode === 'PASSWORD_MISMATCH') {
        setError('errorPasswordMismatch');
      } else if (status === 400 && errorCode === 'WEAK_PASSWORD') {
        setError('errorWeakPassword');
      } else if (status === 422) {
        setError('errorValidation');
      } else if (status === 500 && errorCode === 'EMAIL_SENDING_FAILED') {
        setError('errorOtpEmailFailed');
      } else {
        setError('errorActionFailed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: any, rawOtpValue: string) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setOtpError(null);

    const cleanOtp = (rawOtpValue || '').toString().replace(/[^0-9]/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError('errorInvalidOtpLength');
      return;
    }

    setIsOtpLoading(true);
    try {
      const response = await verifyInviteOtp(orgType, {
        invite_token: inviteToken,
        otp_code: cleanOtp,
      });

      if (response.success) {
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const errorCode = err.response?.data?.error_code || err.response?.data.error_code;

      if (status === 400 && errorCode === 'INVALID_INVITE') {
        // Trong trường hợp OTP call cũng trả về INVALID_INVITE, ta cũng bật cờ
        setIsLinkInvalid(true);
      } else if (status === 400 && errorCode === 'ACCOUNT_NOT_ELIGIBLE') {
        setError('errorOrgNotFound');
      } else if (status === 422) {
        setError('errorValidation');
      } else if (status === 500 && errorCode === 'EMAIL_SENDING_FAILED') {
        setError('errorOtpEmailFailed');
      } else {
        setError('errorActionFailed');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  return {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isLoading, isSuccess,
    error, setError, 
    email,           
    handleSetupPassword,
    handleVerifyOtp,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    isOtpLoading,
    otpError,
    setOtpError,
    isLinkInvalid,
  };
}