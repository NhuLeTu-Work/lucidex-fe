import { useState, useCallback, useEffect } from 'react';
import type { UIAdminAccount } from '../../types/superAdmin';
import { getAdminsApi } from '@/api/endpoints/super/getAdminsApi';

export function useGetAdmins(
  showToast: (type: 'success' | 'error' | 'warning', messageKey: string) => void
) {
  const [accounts, setAccounts] = useState<UIAdminAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const data = await getAdminsApi();
      const mappedAccounts: UIAdminAccount[] = data.map(acc => ({
        id: acc.id,
        username: acc.username,
        role: acc.role === 'super' ? 'Super Admin' : 'Admin',
        locked: acc.status === 'locked' || acc.status === 'inactive',
        totpEnabled: acc.twofa_enabled,
      }));
      setAccounts(mappedAccounts);
    } catch (error: any) {
      if (error.response?.status === 401) {
        showToast('error', 'errorAdminSession');
      } else if (error.response?.status === 403) {
        showToast('error', 'notEnoughPowerAdmin');
      } else {
        showToast('error', 'errorNetwork');
      }
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, isLoadingAccounts, fetchAccounts };
}