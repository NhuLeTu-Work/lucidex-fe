import { registerOwnerApi } from '@/api/endpoints/owner/registerOwnerApi';
import type { RegisterState } from './types';

export function useOwnerRegister(
  state: RegisterState,
  validatePassword: (pwd: string) => boolean,
  t: any,
  // setRole: any,
  // navigate: any
) {
  
  const handleOwnerRegister = async (e: React.FormEvent) => {
    const {
      fullName, email, password, confirmPassword,
      setError, setIsLoading, setShowOtpModal,
      setOtpValue, setOtpError,
    } = state;
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('errorFieldsRequired'));
      return;
    }

    const nameRegex = /^[\p{L}\s]+$/u;
    if (!nameRegex.test(fullName.trim())) {
      setError(t('errorInvalidName') || 'Full name must contain only letters and spaces.');
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }
    if (!validatePassword(password)) {
      setError(t('errorWeakPassword'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerOwnerApi({
        full_name: fullName.trim(),
        email: email.trim(),
        password: password,
        confirm_password: confirmPassword,
      });

      if (response.success) {
        setShowOtpModal(true);
        setOtpValue('');
        setOtpError(null);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err: any) {
      console.log('Lỗi Backend trả về:', err.response.data)
      if (err.response) {
        if (err.response.status === 422) {
          setError('Dữ liệu không hợp lệ, vui lòng kiểm tra lại form.');
        } else if (err.response.status === 400 || err.response.status === 409) {
          setError(err.response.data.message || t('errorEmailExists'));
        } else {
          setError(err.response.data.message || 'Lỗi kết nối đến máy chủ.');
        }
      } else {
        setError('Lỗi mạng. Không thể kết nối đến máy chủ.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleOwnerRegister};
}