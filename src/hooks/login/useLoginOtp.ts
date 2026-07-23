import { verifyTotpSetupApi } from '@/api/endpoints/admin/verifyTotpSetupApi';
import { verifyAdminTotpLoginApi } from '@/api/endpoints/admin/verifyTotpLoginApi';
import type { LoginState } from './types';
import { verifyOtpLoginApi } from '@/api/endpoints/authentication/verifyOtpLoginApi';
export function useLoginOtp(
  state: LoginState,
  setRole: any,
  navigate: any
) {
  const {
    currentAcc, otpValue, setOtpError,
    setIsOtpLoading, resendTimestamps, setOtpSuccessMessage,
    setResendCountdown, switchTimestamps, setIsSwitchDisabled,
    setOtpMethod, setOtpValue: clearOtpValue,
    setupToken,
    challengeToken,
    tempOtpToken
  } = state;

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 6) return;

    setIsOtpLoading(true);
    setOtpError(null);

    try {
      // LUỒNG DÀNH CHO ADMIN / SUPER ADMIN
      if (currentAcc?.type === 'super' || currentAcc?.type === 'admin') {
        
        // Luồng 1: Xác nhận Setup TOTP lần đầu (có setupToken)
        if (setupToken) {
          const response = await verifyTotpSetupApi({
            setup_token: setupToken,
            otp_code: otpValue,
          });

          if (response.success) {
            localStorage.setItem('access_token', response.data.access_token);
            setRole(currentAcc.type);
            navigate(currentAcc.type === 'super' ? '/super' : '/admin');
          } else {
            // SỬA Ở ĐÂY: Bỏ t(), lưu thẳng chuỗi message của BE hoặc dùng key
            setOtpError('errorOtpInvalid');
          }
        } 
        
        // Luồng 2: Xác thực TOTP đăng nhập thông thường (có challengeToken)
        else if (challengeToken) {
          const response = await verifyAdminTotpLoginApi({
            challenge_token: challengeToken,
            otp_code: otpValue,
          });

          if (response.success && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            setRole(currentAcc.type);
            navigate(currentAcc.type === 'super' ? '/super' : '/admin');
          } else {
            // SỬA Ở ĐÂY
            setOtpError('errorOtpInvalid');
          }
        } 
        
        // Bắt lỗi rỗng nếu state bị mất do reload hoặc lỗi logic
        else {
          // SỬA Ở ĐÂY: Dùng key thay vì chuỗi tiếng Việt
          setOtpError('errorInvalidSession'); 
        }
      }
      
      // TODO: LUỒNG DÀNH CHO OWNER VÀ CÁC ROLE KHÁC SẼ NẰM Ở ĐÂY
      else if(currentAcc?.type === 'owner') {
        
        if (!tempOtpToken) {
          // SỬA Ở ĐÂY: Dùng key thay vì chuỗi tiếng Việt
          setOtpError('errorInvalidSession');
          setIsOtpLoading(false);
          return;
        }

        // Gọi API Verify Email OTP
        const response = await verifyOtpLoginApi({
          otp_token: tempOtpToken,
          otp_code: otpValue,
        });

        if (response.success && response.data.access_token) {
          // 1. Lưu Access Token
          localStorage.setItem('access_token', response.data.access_token);
          
          // 2. Lưu Refresh Token (Nâng cao bảo mật phiên)
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }

          // 3. Phân quyền và điều hướng
          setRole('owner');
          navigate('/owner');

        } else {
          // SỬA Ở ĐÂY
          setOtpError('errorOtpInvalid');
        }
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 422) {
          // SỬA Ở ĐÂY
          setOtpError('errorInvalidData');
        } else if (err.response.status === 400 || err.response.status === 401) {
          // SỬA Ở ĐÂY
          setOtpError('errorOtpInvalid');
        } else {
          // SỬA Ở ĐÂY
          setOtpError('errorServer');
        }
      } else {
        // SỬA Ở ĐÂY
        setOtpError('errorNetwork');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendOTP = () => {
    const now = Date.now();
    resendTimestamps.current = resendTimestamps.current.filter(ts => now - ts < 5 * 60 * 1000);

    if (resendTimestamps.current.length >= 3) {
      setOtpSuccessMessage('');
      setOtpError('errorTooManyAttempts');
      return;
    }

    resendTimestamps.current.push(now);
    setOtpError(null);
    setOtpSuccessMessage('otpResent');
    setResendCountdown(60);
  };

  const handleSwitchMethod = (newMethod: 'email' | 'sms') => {
    const now = Date.now();
    switchTimestamps.current = switchTimestamps.current.filter(ts => now - ts < 10 * 1000);

    if (switchTimestamps.current.length >= 3) {
      setIsSwitchDisabled(true);
      setOtpSuccessMessage('');
      setOtpError('errorSwitchCooldown');
      setTimeout(() => { setIsSwitchDisabled(false); setOtpError(null); }, 10 * 1000);
      return;
    }

    switchTimestamps.current.push(now);
    setOtpMethod(newMethod);
    clearOtpValue('');
    setOtpError(null);
    setOtpSuccessMessage('otpResent');
    setResendCountdown(60);
  };

  return { handleVerify2FA, handleResendOTP, handleSwitchMethod };
}