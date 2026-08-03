import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getOwnerEkycStatusApi } from '@/api/endpoints/owner/getOwnerEkycStatusApi';
import type { OwnerEkycStatusData } from '@/api/types/owner.types';

export function useOwnerEkycStatus() {
  const { t, showToast } = useApp();
  const [data, setData] = useState<OwnerEkycStatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setErrorKey(null);
    try {
      const res = await getOwnerEkycStatusApi();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err: any) {
      setData(null);
      const status = err?.response?.status;
      const errorCode = err?.response?.data?.error_code;

      let key = 'errInternalServerError';
      if (status === 401 || errorCode === 'UNAUTHORIZED') {
        key = 'errUnauthorized';
      } else if (errorCode === 'OWNER_ACCESS_REQUIRED') {
        key = 'errOwnerAccessRequired';
      } else if (errorCode === 'OWNER_INACTIVE') {
        key = 'errOwnerInactive';
      } else if (errorCode === 'OWNER_NOT_FOUND') {
        key = 'errOwnerNotFound';
      }

      setErrorKey(key);
      showToast('error', t(key));
    } finally {
      setIsLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    data,
    isVerified: data?.status === 'verified',
    isLoading,
    errorKey,
    refetch: fetchStatus,
  };
}
