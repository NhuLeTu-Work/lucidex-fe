import { useState, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { createVerifiedLinkApi } from '@/api/endpoints/owner/createVerifiedLinkApi';
import type {
  CreateVerifiedLinkPayload,
  VerifiedLinkData,
} from '@/api/types/owner.types';

export function useCreateVerifiedLink() {
  const { showToast, t } = useApp();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdData, setCreatedData] = useState<VerifiedLinkData | null>(null);

  const generateLinkCode = useCallback(
    async (payload: CreateVerifiedLinkPayload): Promise<VerifiedLinkData | null> => {
      setIsSubmitting(true);
      try {
        const res = await createVerifiedLinkApi(payload);
        if (res.success && res.data) {
          setCreatedData(res.data);
          return res.data;
        }
        showToast('error', res.message ? (t(res.message) || res.message) : t('errCreateLinkFailed'));
        return null;
      } catch (err: any) {
        const errorCode = err?.response?.data?.error_code;
        const backendMessage = err?.response?.data?.message;

        let msg = t('errCreateLinkFailed');
        if (errorCode === 'CREDENTIAL_NOT_FOUND') {
          msg = t('errCredentialNotFound');
        } else if (errorCode === 'CREDENTIAL_NOT_CLAIMED') {
          msg = t('errCredentialNotClaimed');
        } else if (errorCode === 'INVALID_EXPIRATION') {
          msg = t('errInvalidExpiration');
        } else if (errorCode === 'INVALID_ACCESS_COUNT') {
          msg = t('errInvalidAccessCount');
        } else if (errorCode === 'INVALID_ORG_ID') {
          msg = t('errInvalidOrgId');
        } else if (backendMessage) {
          msg = t(backendMessage) || backendMessage;
        }

        showToast('error', msg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [showToast, t]
  );

  return {
    generateLinkCode,
    isSubmitting,
    createdData,
    setCreatedData,
  };
}
