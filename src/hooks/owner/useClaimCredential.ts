import { useState, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { claimCredentialApi } from '@/api/endpoints/owner/claimCredentialApi';

export function useClaimCredential() {
  const { t, showToast } = useApp();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const claimSingleCredential = useCallback(
    async (credentialId: string): Promise<boolean> => {
      try {
        const res = await claimCredentialApi(credentialId);
        if (res.success) {
          return true;
        }
        return false;
      } catch (err: any) {
        const status = err?.response?.status;
        const errorCode = err?.response?.data?.error_code;
        const backendMessage = err?.response?.data?.message;

        let key = 'errInternalServerError';
        if (status === 401 || errorCode === 'UNAUTHORIZED') {
          key = 'errUnauthorized';
        } else if (errorCode === 'FORBIDDEN') {
          key = 'errOwnerAccessRequired';
        } else if (errorCode === 'EKYC_NOT_VERIFIED') {
          key = 'errEkycNotVerified';
        } else if (errorCode === 'CREDENTIAL_NOT_MATCHED') {
          key = 'errCredentialNotMatched';
        } else if (errorCode === 'OWNER_NOT_FOUND') {
          key = 'errOwnerNotFound';
        } else if (errorCode === 'CREDENTIAL_NOT_FOUND') {
          key = 'errCredentialNotFound';
        } else if (errorCode === 'CREDENTIAL_ALREADY_CLAIMED') {
          key = 'errCredentialAlreadyClaimed';
        } else if (errorCode === 'MATCH_NOT_CLAIMABLE') {
          key = 'errMatchNotClaimable';
        } else if (status === 422 || errorCode === 'VALIDATION_ERROR') {
          key = 'errValidationError';
        } else if (status === 500 || errorCode === 'INTERNAL_SERVER_ERROR') {
          key = 'errInternalServerError';
        }

        const displayMsg = backendMessage ? `${t(key)} (${backendMessage})` : t(key);
        showToast('error', displayMsg);
        return false;
      }
    },
    [showToast, t]
  );

  const claimCredentials = useCallback(
    async (
      credentialIds: string[],
      onSuccess?: () => void
    ): Promise<boolean> => {
      if (!credentialIds || credentialIds.length === 0) {
        showToast('success', t('noUnclaimedCredentials') || 'Không có văn bằng nào cần nhận.');
        return false;
      }

      setIsClaiming(true);
      let successCount = 0;
      try {
        for (const id of credentialIds) {
          const ok = await claimSingleCredential(id);
          if (ok) {
            successCount++;
          }
        }

        if (successCount > 0) {
          showToast(
            'success',
            t('claimSuccess') || `Nhận thành công ${successCount} văn bằng!`
          );
          if (onSuccess) {
            onSuccess();
          }
          return true;
        }
        return false;
      } finally {
        setIsClaiming(false);
      }
    },
    [claimSingleCredential, showToast, t]
  );

  return {
    claimCredentials,
    claimSingleCredential,
    isClaiming,
  };
}
