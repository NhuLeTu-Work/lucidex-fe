import { useState } from 'react';
import { deleteAdminApi } from '@/api/endpoints/super/deleteAdminApi';

export function useDeleteAdmin(
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void,
  onSuccess: () => void
) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAdmin = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteAdminApi(id);
      showToast('success', 'deleteAdminSuccess');
      onSuccess(); // Triger fetchAccounts
      return true;
    } catch (error: any) {
      const code = error.response?.status;
      const errCode = error.response?.data?.error_code || error.response?.data.error_code;

      if (code === 401) {
        showToast('error', 'errorAdminSession');
      } else if (code === 403 && errCode === 'SUPER_ADMIN_REQUIRED') {
        showToast('error', 'notEnoughPowerAdmin');
      } else if (code === 403 && errCode === 'CANNOT_DELETE_SUPER_ADMIN') {
        showToast('error', 'errorCannotDeleteSuperAdmin');
      } else if (code === 404) {
        showToast('error', 'errorAccountNotFound');
      } else {
        showToast('error', 'errorActionFailed');
      }
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAdmin, isDeleting };
}