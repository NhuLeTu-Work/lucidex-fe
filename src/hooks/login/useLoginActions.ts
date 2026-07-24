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

  const processLogin = async (loginIdentifier: string, userPwd?: string) => {
    setError(null);
    setIsLoading(true);

    if (!loginIdentifier || !userPwd) {
      setError('errorMissingCreds');
      setIsLoading(false);
      return;
    }
    
    try {
      // Phương pháp loại trừ: Kiểm tra xem chuỗi nhập vào có phải là Email không
      const isEmail = loginIdentifier.includes('@'); 

      if (!isEmail) {
        // ==========================================
        // LUỒNG 1: KHÔNG PHẢI EMAIL -> LÀ ADMIN HOẶC SUPER ADMIN
        // ==========================================
        const response = await loginAdminApi({
          username: loginIdentifier.trim(),
          password: userPwd
        });

        if (response.success) {
          const { requires_totp_setup, requires_totp, setup_token, challenge_token, qr_code, manual_entry_key, role } = response.data as any;

          const actualRole = role === 'super' || loginIdentifier.trim() === 'super-admin' ? 'super' : 'admin';

          setCurrentAcc({ username: loginIdentifier.trim(), type: actualRole } as any);
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
      } else {
        // ==========================================
        // LUỒNG 2: LÀ EMAIL -> CÁC ROLE CÒN LẠI
        // ==========================================
        const response = await authLoginApi({
          email: loginIdentifier.trim(),
          password: userPwd
        });

        if (response.success && response.data.otp_token) {
          setTempOtpToken(response.data.otp_token);
          
          const userRole = response.data.role || 'owner'; // fallback an toàn
          
          setCurrentAcc({ email: loginIdentifier.trim(), type: userRole } as any); 
          setOtpValue('');
          setOtpMethod('email'); 
          setView('login_2fa');
        }
      }

    } catch (err: any) {
      // Cập nhật xử lý lỗi theo API document mới nhất
      if (err.response) {
        const status = err.response.status;
        
        if (status === 401) {
          setError('errorInvalidCredentials');
        } else if (status === 403) {
          setError('errorInactiveAccount');
        } else if (status === 404) {
          setError('errorAccountNotFound');
        } else if (status === 422) {
          setError('errorInvalidData');
        } else {
          // Bắt các lỗi server (500) hoặc các lỗi khác kèm message từ BE (nếu có)
          setError('errorServer');
        }
      } else {
        // Lỗi không có response (không có mạng, sập server...)
        setError('errorNetwork');
      }
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

  const handleQuickLogin = (demoEmail: string) => {
    state.setEmail(demoEmail);
    state.setPassword('••••••••');
    processLogin(demoEmail, '••••••••');
  };

  const { handleGoogleAuth } = useGoogleAuth(state, navigate, setRole);

  return { processLogin, handleLogin, handleQuickLogin, handleGoogleAuth };
}