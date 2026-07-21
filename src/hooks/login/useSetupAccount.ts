import type { LoginState } from './types';

export function useSetupAccount(state: LoginState) {
  const {
    setupPassword, setupConfirm, setError,
    setIsLoading, setIsSetupSuccess,
    setOtpValue, setOtpMethod, setView
  } = state;

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSetupAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (setupPassword !== setupConfirm) {
      setError('errorPasswordMismatch');
      return;
    }
    if (!validatePassword(setupPassword)) {
      setError('errorWeakPassword');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSetupSuccess(true);
      setTimeout(() => {
        setIsSetupSuccess(false);
        setOtpValue('');
        setOtpMethod('email');
        setView('setup_2fa');
      }, 2000);
    }, 1000);
  };

  return { handleSetupAccount };
}