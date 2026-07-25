import { useState } from 'react';
import { setupPasswordAndRequestOtp, verifyInviteOtp } from '@/api/endpoints/business/setupPasswordApi';
import type { OrgType } from '@/api/types/business.types';
import { useNavigate } from 'react-router';

export function useSetupPassword(inviteToken: string, orgType: OrgType, emailUrl: string = '', onSuccess: () => void) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // State xử lý riêng cho OTP
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [email] = useState<string>(emailUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('errorPasswordMismatch'); // Sử dụng Key
      return;
    }

    if (password.length < 8) {
      setError('errorWeakPassword'); // Sử dụng Key
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
      if (err.response?.status === 422) {
        setIsLinkInvalid(true);
        setError('errorInvalidInviteLink'); // Key mới
      } else {
        setError('errorServerConnection');
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
      if (err.response?.status === 422) {
        setOtpError('errorOtpInvalid');
      } else {
        setOtpError('errorServer');
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
    isLinkInvalid, setIsLinkInvalid,
    isOtpLoading,
    otpError,
    setOtpError
  };
}