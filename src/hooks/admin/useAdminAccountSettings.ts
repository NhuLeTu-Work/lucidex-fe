import { useState } from 'react';
import { adminAccountApi } from '@/api/endpoints/admin/accountSettingsApi';

export function useAdminAccountSettings() {
  const [loadingType, setLoadingType] = useState<'password' | 'totp' | null>(null);
  const [requestedPassword, setRequestedPassword] = useState(false);
  const [requestedTotp, setRequestedTotp] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleRequestPasswordReset = async () => {
    setLoadingType('password');
    setErrorKey(null);
    try {
      const data = await adminAccountApi.requestResetPassword();
      if (data.password_reset_requested) {
        setRequestedPassword(true);
      }
    } catch (err: any) {
      // Nếu API lỗi mạng hoặc server trả về lỗi, set Key tương ứng
      setErrorKey(err.message === 'errorServer' ? 'errorServer' : 'errorNetwork');
    } finally {
      setLoadingType(null);
    }
  };

  const handleRequestTotpReset = async () => {
    setLoadingType('totp');
    setErrorKey(null);
    try {
      const data = await adminAccountApi.requestResetTotp();
      if (data.totp_reset_requested) {
        setRequestedTotp(true);
      }
    } catch (err: any) {
      setErrorKey(err.message === 'errorServer' ? 'errorServer' : 'errorNetwork');
    } finally {
      setLoadingType(null);
    }
  };

  return {
    loadingType,
    requestedPassword,
    requestedTotp,
    errorKey,
    handleRequestPasswordReset,
    handleRequestTotpReset
  };
}