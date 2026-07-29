import { authLoginApi } from '@/api/endpoints/authentication/loginApi';
import { loginAdminApi } from '@/api/endpoints/admin/loginAdmin';
import type { LoginState } from './types';
import { useGoogleAuth } from './useGoogleAuth';

export function useLoginActions(state: LoginState, navigate?: any, setRole?: any,) {
  const {
    setError, setIsLoading, setCurrentAcc, setOtpValue,
    setSetupToken, setQrCode, setManualEntryKey, setView,
    setChallengeToken, setTempOtpToken, setOtpMethod,
    email, password
  } = state;

  // useLoginActions.ts
  const processUserLogin = async (email: string, userPwd: string) => {
    const response = await authLoginApi({ email: email.trim(), password: userPwd });
    if (response.success && response.data.otp_token) {
      setTempOtpToken(response.data.otp_token);
      const userRole = response.data.role || 'owner';
      setCurrentAcc({ email: email.trim(), type: userRole } as any);
      setOtpValue('');
      setOtpMethod('email');
      setView('login_2fa');
    }
  };

  const processAdminLogin = async (username: string, userPwd: string) => {
    const response = await loginAdminApi({ username: username.trim(), password: userPwd });
    if (response.success) {
      const { requires_totp_setup, requires_totp, setup_token, challenge_token, qr_code, manual_entry_key, role } = response.data as any;
      const actualRole = role === 'super' || username.trim() === 'super-admin' ? 'super' : 'admin';
      setCurrentAcc({ username: username.trim(), type: actualRole } as any);
      setOtpValue('');
      if (requires_totp_setup) {
        setSetupToken(setup_token || null);
        setQrCode(qr_code || null);
        setManualEntryKey(manual_entry_key || null);
        setView('setup_2fa');
      } else if (requires_totp) {
        setChallengeToken(challenge_token || null);
        setView('login_2fa');
      }
    }
  };

  const handleUserLoginError = (err: any) => {
    if (!err.response) return setError('errorNetwork');
    const { status, data } = err.response;
    const code = data?.error_code;
    if (status === 401 && code === 'INVALID_CREDENTIALS') setError('errorInvalidCredentials');
    else if (status === 403) setError('errorInactiveAccount');
    else if (status === 404) setError('errorAccountNotFound');
    else if (status === 409 && code === 'GOOGLE_ACCOUNT_PASSWORD_LOGIN_NOT_ALLOWED') setError('errorEmailExistsGoogle');
    else setError('errorAdminAuthentication'); // tên constant nên đổi cho đúng ngữ nghĩa, xem ghi chú bên dưới
  };

  const handleAdminLoginError = (err: any) => {
    if (!err.response) return setError('errorNetwork');
    const { status, data } = err.response;
    const code = data?.error_code;
    if (status === 401 && code === 'INVALID_ADMIN_CREDENTIALS') setError('errorInvalidCredentials');
    else if (status === 422 && code === 'VALIDATION_ERROR') setError('errorInactiveAccount');
    else if (status === 404) setError('errorAccountNotFound');
    else setError('errorServer');
  };

  const processLogin = async (loginIdentifier: string, userPwd?: string) => {
    setError(null);
    setIsLoading(true);
    if (!loginIdentifier || !userPwd) {
      setError('errorMissingCreds');
      setIsLoading(false);
      return;
    }
    const isEmail = loginIdentifier.includes('@');
    try {
      if (isEmail) {
        await processUserLogin(loginIdentifier, userPwd);
      } else {
        await processAdminLogin(loginIdentifier, userPwd);
      }
    } catch (err: any) {
      isEmail ? handleUserLoginError(err) : handleAdminLoginError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('errorFieldsRequired'); // Đổi sang dùng t()
      return;
    }
    processLogin(email, password);
  };


  const { handleGoogleAuth } = useGoogleAuth(state, navigate, setRole);

  return { processLogin, handleLogin, handleGoogleAuth };
}