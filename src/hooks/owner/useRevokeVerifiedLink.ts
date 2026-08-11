import { useState } from 'react';
import { revokeVerifiedLinkApi } from '@/api/endpoints/owner/revokeVerifiedLinkApi';
import { useApp } from '@/app/AppContext';

export function useRevokeVerifiedLink() {
  const { showToast } = useApp();
  const [isRevoking, setIsRevoking] = useState(false);

  const revokeLink = async (linkId: string, onSuccess?: () => void) => {
    setIsRevoking(true);
    try {
      const res = await revokeVerifiedLinkApi(linkId);
      if (res.success) {
        showToast('success', res.message || 'Mã xác thực đã được thu hồi.');
        onSuccess?.();
        return true;
      } else {
        showToast('error', res.message || 'Thu hồi mã thất bại.');
        return false;
      }
    } catch (err: any) {
      console.error('Failed to revoke verification code:', err);
      const msg = err?.response?.data?.message || 'Không thể thu hồi mã chia sẻ.';
      showToast('error', msg);
      return false;
    } finally {
      setIsRevoking(false);
    }
  };

  return { revokeLink, isRevoking };
}
