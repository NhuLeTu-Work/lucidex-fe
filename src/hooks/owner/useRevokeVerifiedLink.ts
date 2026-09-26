import { useState } from 'react';
import { revokeVerifiedLinkApi } from '@/api/endpoints/owner/revokeVerifiedLinkApi';
import { useApp } from '@/app/AppContext';

export function useRevokeVerifiedLink() {
  const { showToast, t } = useApp();
  const [isRevoking, setIsRevoking] = useState(false);

  const revokeLink = async (linkId: string, onSuccess?: () => void) => {
    setIsRevoking(true);
    try {
      const res = await revokeVerifiedLinkApi(linkId);
      if (res.success) {
        showToast('success', res.message ? (t(res.message) || res.message) : t('codeRevokedMsg'));
        onSuccess?.();
        return true;
      } else {
        showToast('error', res.message ? (t(res.message) || res.message) : t('revokeLinkFailed'));
        return false;
      }
    } catch (err: any) {
      console.error('Failed to revoke verification code:', err);
      const msg = err?.response?.data?.message || t('revokeLinkFailed');
      showToast('error', t(msg) || msg);
      return false;
    } finally {
      setIsRevoking(false);
    }
  };

  return { revokeLink, isRevoking };
}
