import { authLoginApi } from '@/api/endpoints/authentication/loginApi';
import { loginAdminApi } from '@/api/endpoints/admin/loginAdmin';
import type { LoginState } from './types';

export function useLoginActions(state: LoginState, t: any) {
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
      setError(t('errorMissingCreds'));
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
          // Ép kiểu as any tạm thời nếu interface LoginAdminResponse chưa có trường role
          const { requires_totp_setup, requires_totp, setup_token, challenge_token, qr_code, manual_entry_key, role } = response.data as any;

          // ĐIỂM QUAN TRỌNG: Xác định quyền thực sự (Ưu tiên lấy từ BE, nếu BE chưa có thì check tạm bằng username)
          const actualRole = role === 'super' || loginIdentifier.trim() === 'super-admin' ? 'super' : 'admin';

          // Lưu type linh hoạt theo actualRole thay vì fix cứng 'admin'
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
        // LUỒNG 2: LÀ EMAIL -> CÁC ROLE CÒN LẠI (Hiện tại gọi Owner API)
        // ==========================================
        const response = await authLoginApi({
          email: loginIdentifier.trim(),
          password: userPwd
        });

        if (response.success && response.data.otp_token) {
          setTempOtpToken(response.data.otp_token);
          
          setCurrentAcc({ email: loginIdentifier.trim(), type: 'owner' } as any); 
          setOtpValue('');
          setOtpMethod('email'); 
          setView('login_2fa');
        }
      }

    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 404) {
          setError('Email hoặc mật khẩu không chính xác.');
        } else if (err.response.status === 422) {
          setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
        } else {
          setError(err.response.data.message || 'Lỗi server. Vui lòng thử lại.');
        }
      } else {
        setError('Lỗi mạng. Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('errorFieldsRequired');
      return;
    }
    processLogin(email, password);
  };

  const handleQuickLogin = (demoEmail: string) => {
    state.setEmail(demoEmail);
    state.setPassword('••••••••');
    processLogin(demoEmail, '••••••••'); // Truyền trực tiếp pass giả lập vào hàm xử lý
  };

  return { processLogin, handleLogin, handleQuickLogin };
}