import { verifyTotpSetupApi } from '@/api/endpoints/admin/verifyTotpSetupApi';
import { verifyAdminTotpLoginApi } from '@/api/endpoints/admin/verifyTotpLoginApi';
import type { LoginState } from './types';
import { verifyOtpLoginApi } from '@/api/endpoints/authentication/verifyOtpLoginApi';
import { saveTokens } from '../useSessionTimer';
export function useLoginOtp( state: LoginState, setRole: any, navigate: any ) {
  const {
    currentAcc, otpValue, setOtpError,
    setIsOtpLoading,
    setupToken, challengeToken, tempOtpToken
  } = state;

  const handle2FALogin = async (e: any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    setOtpError(null);

    const cleanOtp = (otpValue || '').toString().replace(/[^0-9]/g, '');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError('errorOtpInvalidLength'); 
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
            sessionStorage.removeItem('login_flow_state')
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
            sessionStorage.removeItem('login_flow_state')
            setRole(currentAcc.type);
            navigate(currentAcc.type === 'super' ? '/super' : '/admin');
          } else {
            setOtpError('errorOtpInvalid');
          }
        } 
        else {
          setOtpError('errorSessionExpired'); 
        }
      }
      
      // LUỒNG 2: DÀNH CHO OWNER VÀ CÁC BÊN (ISSUER/VERIFIER)
      else {
        if (!tempOtpToken) {
          setOtpError('errorSessionExpired');
          setIsOtpLoading(false);
          return;
        }
        const response = await verifyOtpLoginApi({
          otp_token: tempOtpToken,
          otp_code: cleanOtp,
        });

        if (response.success && response.data.access_token) {
          saveTokens(response.data.access_token, response.data.refresh_token, response.data.refresh_token_expires_at);
          sessionStorage.removeItem('login_flow_state')
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
        const errorCode = err.response.data?.error_code;
        if (currentAcc?.type == 'super' || currentAcc?.type == 'admin') {
          if (status === 401 && errorCode === 'INVALID_ADMIN_TOKEN') {
            setOtpError('errorAdminToken');
          } else if (status === 422 && errorCode === 'VALIDATION_ERROR') {
            setOtpError('errorOtpInvalidLength');
          } else if (status === 401 && errorCode === 'INVALID_AUTHENTICATION_CODE') {
            setOtpError('errorOtpInvalid');
          }
        } else {
          if (status === 400 && errorCode === 'INVALID_OTP') {
            setOtpError('errorOtpInvalid');
          } else if (status === 401 && errorCode === 'HTTP_401') {
            setOtpError('errorSessionExpired');
          } else if (status === 401 && errorCode === 'INVALID_CREDENTIALS') {
            setOtpError('errorActorNotFound');
          } else if (status === 422 && errorCode === 'VALIDATION_ERROR') {
            setOtpError('errorValidation');
          } else {
            setOtpError('errorActionFailed');
          }
        }
      } else {
        setOtpError('errorNetwork');
      }
    } finally {
      setIsOtpLoading(false);
    }
  };

  return { handle2FALogin };
}