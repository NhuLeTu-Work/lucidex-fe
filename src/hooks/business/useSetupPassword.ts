import { useState } from 'react';
import { setupPasswordAndRequestOtp, verifyInviteOtp } from '@/api/endpoints/business/setupPasswordApi';
import type { OrgType } from '@/api/types/business.types';

export function useSetupPassword(inviteToken: string, orgType: OrgType, emailUrl: string = '', onSuccess: () => void) {
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
        setError('errorInvalidInviteLink'); // Key mới
      } else {
        setError('errorServerConnection');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent, otpValue: string) => {
    e.preventDefault();
    setOtpError(null); // Reset lỗi trước khi gọi

    if (!otpValue || otpValue.length !== 6) {
      setOtpError('errorInvalidOtpLength'); // Key
      return;
    }

    setIsOtpLoading(true);
    try {
      const response = await verifyInviteOtp(orgType, {
        invite_token: inviteToken,
        otp_code: otpValue,
      });

      if (response.success) {
        // Có thể thêm 1 state success để Modal OTP hiện dấu tick xanh nếu muốn
        setTimeout(() => {
          window.location.href = '/login'; 
        }, 1500);
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setOtpError('errorOtpInvalid'); // Key
      } else {
        setOtpError('errorServer'); // Key
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
    // Export thêm các state của OTP
    isOtpLoading,
    otpError,
    setOtpError
  };
}