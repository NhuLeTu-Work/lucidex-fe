import { useState, useEffect, useRef, useCallback } from 'react';
import { resendOtpApi } from '@/api/endpoints/authentication/resendOtpApt';

export function useResendOtp() {
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

    // Client-side Rate Limit (Tối đa 3 lần / 5 phút)
    const now = Date.now();
    resendTimestamps.current = resendTimestamps.current.filter(ts => now - ts < 5 * 60 * 1000);

    if (resendTimestamps.current.length >= 3) {
      setExternalError('errorTooManyAttempts'); // CHỈ TRUYỀN KEY
      setResendMessage(null);
      return;
    }

    setIsResendOtpLoading(true);
    setResendMessage(null);
    setExternalError(null);

    try {
      // TẠO PAYLOAD ĐÚNG CÚ PHÁP: Chỉ đính kèm field nếu có giá trị
      const payload: { email?: string; token?: string } = {};
      if (email) payload.email = email.trim();
      if (token) payload.token = token.trim();

      const response = await resendOtpApi(payload);
      
      if (response.success) {
        resendTimestamps.current.push(now);
        setResendCountdown(60);
        setResendMessage('otpResent'); // CHỈ TRUYỀN KEY
      }
    } catch (err: any) {
      const status = err.response?.status;
      
      if (status === 404) {
        setExternalError('errorAccountNotFound');
      } else if (status === 422) {
        setExternalError('errorInvalidData');
      } else {
        setExternalError('errorServer');
      }

    } finally {
      setIsResendOtpLoading(false);
    }
  }, [] 
);

  return {
    isResendOtpLoading,
    resendCountdown,
    resendMessage,
    triggerResend,
    setResendMessage
  };
}