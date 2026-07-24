import { verifyTotpSetupApi } from '@/api/endpoints/admin/verifyTotpSetupApi';
import { verifyAdminTotpLoginApi } from '@/api/endpoints/admin/verifyTotpLoginApi';
import type { LoginState } from './types';
import { verifyOtpLoginApi } from '@/api/endpoints/authentication/verifyOtpLoginApi';
export function useLoginOtp( state: LoginState, setRole: any, navigate: any ) {
  const {
    currentAcc, otpValue, setOtpError,
    setIsOtpLoading, resendTimestamps, setOtpSuccessMessage,
    setResendCountdown, switchTimestamps, setIsSwitchDisabled,
    setOtpMethod, setOtpValue: clearOtpValue,
    setupToken, challengeToken, tempOtpToken
  } = state;

  const handleVerify2FA = async (e: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    setOtpError(null);

    const cleanOtp = (otpValue || '').toString().replace(/[^0-9]/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError('errorInvalidOtpLength'); 
      return;
    }

    setIsOtpLoading(true);
    try {
      // LUỒNG 1: DÀNH CHO ADMIN / SUPER ADMIN
      if (currentAcc?.type === 'super' || currentAcc?.type === 'admin') {        
        // Luồng 1A: Xác nhận Setup TOTP lần đầu (Gọi API verifyTotpSetupApi)
        if (setupToken) {
          const response = await verifyTotpSetupApi({
            setup_token: setupToken,
            otp_code: cleanOtp,
          });

          if (response.success && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            if (response.data.refresh_token) {
              localStorage.setItem('refresh_token', response.data.refresh_token);
            }
            setRole(currentAcc.type);
            navigate(currentAcc.type === 'super' ? '/super' : '/admin');
          } else {
            setOtpError('errorOtpInvalid');
          }
        } 
        
        // Luồng 1B: Xác thực TOTP đăng nhập thông thường (CHÍNH XÁC THEO API DOC)
        else if (challengeToken) {
          const response = await verifyAdminTotpLoginApi({
            challenge_token: challengeToken,
            otp_code: cleanOtp,
          });

          if (response.success && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
            if (response.data.refresh_token) {
              localStorage.setItem('refresh_token', response.data.refresh_token); // Đã thêm lưu refresh_token
            }
            setRole(currentAcc.type);
            navigate(currentAcc.type === 'super' ? '/super' : '/admin');
          } else {
            setOtpError('errorOtpInvalid');
          }
        } 
        
        else {
          setOtpError('errorInvalidSession'); 
        }
      }
      
      // LUỒNG 2: DÀNH CHO OWNER VÀ CÁC BÊN (ISSUER/VERIFIER)
      else {
        if (!tempOtpToken) {
          setOtpError('errorInvalidSession');
          setIsOtpLoading(false);
          return;
        }
        const response = await verifyOtpLoginApi({
          otp_token: tempOtpToken,
          otp_code: cleanOtp,
        });

        if (response.success && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }
          
          const safeRole = currentAcc?.type || 'owner';
          setRole(safeRole);
          navigate(`/${safeRole}`);
        } else {
          setOtpError('errorOtpInvalid');
        }
      }
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        if (status === 422) {
          setOtpError('errorInvalidOtpLength'); 
        } else if (status === 400 || status === 401) {
          setOtpError('errorOtpInvalid');
        } else {
          setOtpError('errorServer');
        }
      } else {
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