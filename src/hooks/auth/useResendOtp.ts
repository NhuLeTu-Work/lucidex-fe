import { useState, useRef, useCallback, useEffect } from 'react';
import { resendOtpApi } from '@/api/endpoints/authentication/resendOtpApt';
import type { ResendOtpPayload } from '@/api/types/auth.types';

interface ResendIdentifier {
  email?: string | null;
  token?: string | null;
}

interface UseResendOtpOptions {
  // Optional: chỉ cần truyền khi consumer có switch-method (login 2FA)
  setOtpMethod?: (m: 'email' | 'sms') => void;
  setOtpValue?: (v: string) => void;
}

export function useResendOtp(options: UseResendOtpOptions = {}) {
  const { setOtpMethod, setOtpValue } = options;

  const [isResendOtpLoading, setIsResendOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false);

  const resendTimestamps = useRef<number[]>([]);
  const switchTimestamps = useRef<number[]>([]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // identifier: { email } cho Register/Login, { token } cho invite flow
  const triggerResend = useCallback(
    async (identifier: ResendIdentifier, setExternalError: (msg: string | null) => void) => {
      const now = Date.now();
      resendTimestamps.current = resendTimestamps.current.filter((ts) => now - ts < 5 * 60 * 1000);

      if (resendTimestamps.current.length >= 3) {
        setExternalError('errorTooManyAttempts');
        setResendMessage(null);
        return;
      }

      setIsResendOtpLoading(true);
      setResendMessage(null);
      setExternalError(null);

      try {
        const payload: ResendOtpPayload = {};
        if (identifier.email) payload.email = identifier.email.trim();
        if (identifier.token) payload.token = identifier.token.trim();

        const response = await resendOtpApi(payload);

        if (response.success) {
          resendTimestamps.current.push(now);
          setResendCountdown(60);
          setResendMessage('otpResent');
        }
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 404) setExternalError('errorAccountNotFound');
        else if (status === 422) setExternalError('errorInvalidData');
        else setExternalError('errorServer');
      } finally {
        setIsResendOtpLoading(false);
      }
    },
    []
  );

  // Giữ lại theo yêu cầu — chưa dùng ở UI cho đến khi confirm với backend.
  // TODO: hiện tại backend /resend-otp chưa nhận tham số method (email/sms),
  // nên hàm này mới chỉ đổi UI state, CHƯA gọi API thật để gửi OTP qua kênh mới.
  const handleSwitchMethod = useCallback(
    (newMethod: 'email' | 'sms') => {
      if (!setOtpMethod) return;
      const now = Date.now();
      switchTimestamps.current = switchTimestamps.current.filter((ts) => now - ts < 10 * 1000);

      if (switchTimestamps.current.length >= 3) {
        setIsSwitchDisabled(true);
        setResendMessage(null);
        setTimeout(() => setIsSwitchDisabled(false), 10 * 1000);
        return;
      }

      switchTimestamps.current.push(now);
      setOtpMethod(newMethod);
      setOtpValue?.('');
      setResendMessage('otpResent');
      setResendCountdown(60);
    },
    [setOtpMethod, setOtpValue]
  );

  return {
    isResendOtpLoading,
    resendCountdown,
    resendMessage,
    triggerResend,
    isSwitchDisabled,
    handleSwitchMethod,
  };
}