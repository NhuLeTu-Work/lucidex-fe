import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getVerifiersListApi } from '@/api/endpoints/owner/getVerifiersListApi';
import type { VerifierItem } from '@/api/types/owner.types';

export function useVerifiersList() {
  const { t, showToast } = useApp();
  const [verifiers, setVerifiers] = useState<VerifierItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const fetchVerifiers = useCallback(async () => {
    setIsLoading(true);
    setErrorKey(null);
    try {
      const res = await getVerifiersListApi();
      if (res.success && res.data) {
        setVerifiers(res.data);
      } else {
        setVerifiers([]);
      }
    } catch (err: any) {
      setVerifiers([]);
      const status = err?.response?.status;
      const errorCode = err?.response?.data?.error_code;

      let key = 'errInternalServerError';
      if (status === 401 || errorCode === 'UNAUTHORIZED') {
        key = 'errUnauthorized';
      } else if (status === 403 || errorCode === 'FORBIDDEN' || errorCode === 'OWNER_ACCESS_REQUIRED') {
        key = 'errOwnerAccessRequired';
      }

      setErrorKey(key);
      showToast('error', t(key));
    } finally {
      setIsLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    fetchVerifiers();
  }, [fetchVerifiers]);

  return {
    verifiers,
    isLoading,
    errorKey,
    refetch: fetchVerifiers,
  };
}
