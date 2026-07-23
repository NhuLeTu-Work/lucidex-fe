import { useState, useEffect, useRef, useCallback } from 'react';
import { resendOtpApi } from '@/api/endpoints/authentication/resendOtpApt';

export function useResendOtp(t: any) {
  const [isResendOtpLoading, setIsResendOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  
  // Dùng useRef để giữ lại lịch sử các lần bấm resend (không bị mất khi component re-render)
  const resendTimestamps = useRef<number[]>([]);

  // Xử lý đếm ngược (Countdown timer)
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

  // Hàm trigger dùng chung (Nhận vào email và hàm set error của form hiện tại)
  const triggerResend = useCallback(async (
    email: string | undefined | null, 
    setExternalError: (msg: string | null) => void // Hàm setOtpError từ component gọi nó
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

    // Bắt đầu gọi API
    setIsResendOtpLoading(true);
    setResendMessage(null);
    setExternalError(null); // Xoá lỗi cũ trên UI

    try {
      const response = await resendOtpApi({ email: email.trim() });
      
      if (response.success) {
        resendTimestamps.current.push(now);
        setResendCountdown(60); // Bắt đầu đếm ngược 60s
        setResendMessage(t('otpResent') || 'Đã gửi lại mã OTP mới!');
      }
    } catch (err: any) {
      const status = err.response?.status;
      let errorMessage = 'Có lỗi xảy ra khi gửi lại mã OTP.';
      
      if (status === 404) {
        errorMessage = t('errorAccountNotFound') || 'Tài khoản không tồn tại.';
      } else if (status === 422) {
        errorMessage = t('errorInvalidEmail') || 'Email không hợp lệ.';
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
    setResendMessage // Export ra ngoài lỡ cần tắt thông báo chủ động
  };
}