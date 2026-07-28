import { useState } from 'react';
import { updateAdminStatusApi } from '@/api/endpoints/super/updateAdminStatusApi';

export function useUpdateAdminStatus(
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void,
  onSuccess: () => void
) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (id: string, status: 'active' | 'locked', reason: string | null = null) => {
    setIsUpdating(true);
    try {
      await updateAdminStatusApi(id, { status, reason });
      showToast('success', status === 'locked' ? 'lockSuccess' : 'unlockSuccess');
      onSuccess(); // Triger fetchAccounts
      return true;
    } catch (error: any) {
      const code = error.response?.status;
      const errCode = error.response?.data?.error_code || error.response?.data.error_code;

      if (code === 400 && errCode === 'REASON_REQUIRED') {
        showToast('error', 'errorReasonRequired');
      } else if (code === 401) {
        showToast('error', 'errorAdminSession');
      } else if (code === 403 && errCode === 'SUPER_ADMIN_REQUIRED') {
        showToast('error', 'notEnoughPowerAdmin');
      } else if (code === 403 && errCode === 'CANNOT_LOCK_SUPER_ADMIN') {
        showToast('error', 'errorCannotLockSuperAdmin');
      } else if (code === 404) {
        showToast('error', 'errorAccountNotFound');
      } else if (code === 422) {
        showToast('error', 'errorValidation');
      } else {
        showToast('error', 'errorActionFailed');
      }
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
}