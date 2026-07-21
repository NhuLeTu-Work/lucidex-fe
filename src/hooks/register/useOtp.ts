import { useEffect } from 'react';
import { verifyOwnerOtpApi, resendOwnerOtpApi } from '@/api/endpoints/owner/registerOwnerApi';
import type { RegisterState } from './types';

export function useOtp(
  state: RegisterState,
  t: any,
  setRole: any,
  navigate: any
) {
  const {
    resendCountdown, setResendCountdown,
    otpValue, setOtpError, setIsOtpLoading,
    email, setResendMessage, setIsResendOtpLoading,
    setOtpValue
  } = state;

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown, setResendCountdown]);

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpValue.trim()) return;
    setOtpError(null);
    setIsOtpLoading(true);
    try {
      const response = await verifyOwnerOtpApi({
        email: email.trim(),
        otp_code: otpValue.trim(),
      });

      if (response.success) {
        setRole('owner');
        navigate('/owner');
      } else {
        setOtpError(response.message || t('errorOtpInvalid'));
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          setOtpError('Mã OTP không hợp lệ.');
        } else if (err.response.status === 400) {
          setOtpError(err.response.data.message || t('errorOtpInvalid'));
        } else {
          setOtpError('Lỗi hệ thống. Vui lòng thử lại sau.');
        }
      } else {
        setOtpError('Lỗi mạng. Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    setResendMessage(null);
    setIsResendOtpLoading(true);

    try {
      const response = await resendOwnerOtpApi({
        email: email.trim()
      });

      if (response.success) {
        setResendMessage(t('otpResentSuccess'));
        setOtpValue('');
        setResendCountdown(60); 
      } else {
        setOtpError(response.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          setOtpError('Dữ liệu không hợp lệ.');
        } else {
          setOtpError(err.response.data.message || 'Lỗi hệ thống. Không thể gửi lại mã.');
        }
      } else {
        setOtpError('Lỗi mạng. Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsResendOtpLoading(false);
    }
  };

  return { handleVerifyOTP, handleResendOTP };
}