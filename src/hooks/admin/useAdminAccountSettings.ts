import { useState, useEffect, useCallback } from 'react';
import { adminAccountApi } from '@/api/endpoints/admin/accountSettingsApi';
import { getAdminRequestStatusApi } from '@/api/endpoints/admin/getResetRequestStatusApi';

export function useAdminAccountSettings(
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void
) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingType, setLoadingType] = useState<'password' | 'totp' | null>(null);
  
  const [requestedPassword, setRequestedPassword] = useState(false);
  const [pwdCooldown, setPwdCooldown] = useState(false); // Khóa 24h
  
  const [requestedTotp, setRequestedTotp] = useState(false);
  const [totpCooldown, setTotpCooldown] = useState(false); // Khóa 24h

  const isCooldownActive = (requestedAt: string | null) => {
    if (!requestedAt) return false;
    const requestTime = new Date(requestedAt).getTime();
    const now = new Date().getTime();
    const hoursDifference = (now - requestTime) / (1000 * 60 * 60);
    return hoursDifference < 24; 
  };

  const fetchStatus = useCallback(async () => {
    setIsInitializing(true);
    try {
      const data = await getAdminRequestStatusApi();
      
      setRequestedPassword(data.password_reset_requested);
      setPwdCooldown(!data.password_reset_requested && isCooldownActive(data.password_reset_requested_at));
      
      setRequestedTotp(data.totp_reset_requested);
      setTotpCooldown(!data.totp_reset_requested && isCooldownActive(data.totp_reset_requested_at));
      
    } catch (error: any) {
      showToast('error', 'errorFetchRequestStatus');
    } finally {
      setIsInitializing(false);
    }
  }, [showToast]);

  // Tự động lấy data khi vào trang
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRequestPasswordReset = async () => {
    setLoadingType('password');
    try {
      const data = await adminAccountApi.requestResetPassword();
      if (data.password_reset_requested) {
        showToast('success', 'requestSentSuccess');
        await fetchStatus(); // Tải lại trạng thái mới nhất để đồng bộ Cooldown 24h
      }
    } catch (err: any) {
      const errKey = err.message === 'errorServer' ? 'errorServer' : 'errorNetwork';
      showToast('error', errKey);
    } finally {
      setLoadingType(null);
    }
  };

  const handleRequestTotpReset = async () => {
    setLoadingType('totp');
    try {
      const data = await adminAccountApi.requestResetTotp();
      if (data.totp_reset_requested) {
        showToast('success', 'requestSentSuccess');
        await fetchStatus(); // Tải lại trạng thái mới nhất để đồng bộ Cooldown 24h
      }
    } catch (err: any) {
      const errKey = err.message === 'errorServer' ? 'errorServer' : 'errorNetwork';
      showToast('error', errKey);
    } finally {
      setLoadingType(null);
    }
  };

  return {
    loadingType,
    requestedPassword,
    requestedTotp,
    handleRequestPasswordReset,
    handleRequestTotpReset,
    isInitializing,
    pwdCooldown,
    totpCooldown,
    refetch: fetchStatus
  };
}