import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getOwnerCredentialDetailApi } from '@/api/endpoints/owner/getOwnerCredentialDetailApi';
import type { OwnerCredentialDetailData } from '@/api/types/owner.types';

export function useOwnerCredentialDetail(credentialId: string | null) {
  const { t, showToast } = useApp();
  const [data, setData] = useState<OwnerCredentialDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!credentialId) {
      setData(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getOwnerCredentialDetailApi(credentialId);
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
      } else if (status === 404 || errorCode === 'CREDENTIAL_NOT_FOUND') {
        key = 'errCredentialNotFound';
      } else if (status === 422 || errorCode === 'VALIDATION_ERROR') {
        key = 'errValidationError';
      } else if (status === 500 || errorCode === 'INTERNAL_SERVER_ERROR') {
        key = 'errInternalServerError';
      }

      showToast('error', t(key));
    } finally {
      setIsLoading(false);
    }
  }, [credentialId, showToast, t]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    data,
    isLoading,
    refetch: fetchDetail,
  };
}
