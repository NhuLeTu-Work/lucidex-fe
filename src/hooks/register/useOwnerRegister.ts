import { registerOwnerApi } from '@/api/endpoints/owner/registerOwnerApi';
import type { RegisterState } from './types';

export function useOwnerRegister(
  state: RegisterState,
  validatePassword: (pwd: string) => boolean,
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
      setError('errorFieldsRequired');
      return;
    }

    const nameRegex = /^[\p{L}\s]+$/u;
    if (!nameRegex.test(fullName.trim())) {
      setError('errorInvalidName');
      return;
    }
    if (password !== confirmPassword) {
      setError('errorPasswordMismatch');
      return;
    }
    if (!validatePassword(password)) {
      setError('errorWeakPassword');
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
      if (err.response.status === 400 && err.response.data.error_code === 'PASSWORD_MISMATCH') {
        setError('errorPasswordMismatch');
      } else if (err.response.status === 400 && err.response.data.error_code === 'WEAK_PASSWORD') {
        setError('errorWeakPassword');
      } else if (err.response.status === 422) {
        setError('errorValidation');
      } else if (err.response.status === 409) {
        setError('errorEmailExists');
      } else if (err.response.status === 500 && err.response.data.error_code === 'EMAIL_SENDING_FAILED') {
        setError('errorOtpEmailFailed');
      } else {
        setError('errorActionFailed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleOwnerRegister};
}