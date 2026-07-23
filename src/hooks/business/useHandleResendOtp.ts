import { useState, useEffect, useRef, useCallback } from 'react';
import { resendOtpApi } from '@/api/endpoints/authentication/resendOtpApt';

export function useResendOtp(t: any) {
  const [isResendOtpLoading, setIsResendOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  
  const resendTimestamps = useRef<number[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  // THAY ĐỔI: Thêm tham số `token` vào hàm
  const triggerResend = useCallback(
  async (
    email: string | undefined | null,
    setExternalError: (msg: string | null) => void,
    token?: string | null,
  ) => {
    if (!email) {
      setExternalError(t('errorMissingEmail') || 'Không tìm thấy email để gửi lại OTP.');
      return;
    }

    // Client-side Rate Limit (Tối đa 3 lần / 5 phút)
    const now = Date.now();
    resendTimestamps.current = resendTimestamps.current.filter(ts => now - ts < 5 * 60 * 1000);

    if (resendTimestamps.current.length >= 3) {
      setExternalError(t('errorTooManyAttempts') || 'Bạn đã gửi lại quá nhiều lần. Vui lòng thử lại sau 5 phút.');
      setResendMessage(null);
      return;
    }

    setIsResendOtpLoading(true);
    setResendMessage(null);
    setExternalError(null);

    try {
      // THAY ĐỔI: Thêm token vào payload gửi lên API
      const payload = { 
        email: email.trim(),
        ...(token && { token: token.trim() }) // Gắn token nếu có
      };

      const response = await resendOtpApi(payload);
      
      if (response.success) {
        resendTimestamps.current.push(now);
        setResendCountdown(60);
        setResendMessage(t('otpResent') || 'Đã gửi lại mã OTP mới!');
      }
    } catch (err: any) {
      const status = err.response?.status;
      let errorMessage = 'Có lỗi xảy ra khi gửi lại mã OTP.';
      
      if (status === 404) {
        errorMessage = t('errorAccountNotFound') || 'Tài khoản không tồn tại.';
      } else if (status === 422) {
        errorMessage = t('errorInvalidEmail') || 'Dữ liệu yêu cầu không hợp lệ (Kiểm tra lại email hoặc token).';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setExternalError(errorMessage);
    } finally {
      setIsResendOtpLoading(false);
    }
  }, [t]);

  return {
    isResendOtpLoading,
    resendCountdown,
    resendMessage,
    triggerResend,
    setResendMessage
  };
}