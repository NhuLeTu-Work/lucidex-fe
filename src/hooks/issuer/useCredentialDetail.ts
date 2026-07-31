import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { getCredentialDetailApi } from '@/api/endpoints/issuer/getCredentialDetailApi';
import type { CredentialDetailData } from '@/api/endpoints/issuer/getCredentialDetailApi';
export function useCredentialDetail(credentialId: string | null) {
  const { t, showToast } = useApp();
  const [data, setData] = useState<CredentialDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!credentialId) {
      setData(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getCredentialDetailApi(credentialId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err: any) {
      setData(null);
      const status = err?.response?.status;
      const errorCode = err?.response?.data?.error_code;
      const msg = err?.response?.data?.message || err?.message;

      if (status === 401 || errorCode === 'UNAUTHORIZED') {
        showToast('error', t('errorSessionExpired'));
      } else if (status === 404 || errorCode === 'HTTP_404') {
        showToast('error', msg || t('noDataFound'));
      } else if (status === 422 || errorCode === 'VALIDATION_ERROR') {
        showToast('error', msg || t('errorRegValidation'));
      } else if (status === 500 || errorCode === 'INTERNAL_SERVER_ERROR') {
        showToast('error', msg || t('errCheckDuplicatesFailed'));
      } else {
        showToast('error', msg || t('noDataFound'));
      }
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
