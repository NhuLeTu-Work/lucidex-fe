import { useState, useEffect, useCallback } from 'react';
import { getAdminsApi } from '@/api/endpoints/super/getAdminsApi';
import { toast } from 'sonner';
import type { UIAdminAccount } from '../../types/superAdmin';

export function useGetAdmins(t: any) {
  const [accounts, setAccounts] = useState<UIAdminAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoadingAccounts(true);
    try {
      const data = await getAdminsApi();
      
      const mappedAccounts: UIAdminAccount[] = data.map(acc => ({
        id: acc.id,
        username: acc.username,
        // Map lại role để UI nhận diện đúng màu sắc
        role: acc.role === 'super' ? 'Super Admin' : 'Admin', 
        locked: acc.status === 'locked' || acc.status === 'inactive', 
        totpEnabled: acc.twofa_enabled
      }));

      setAccounts(mappedAccounts);
      console.log(mappedAccounts)
    } catch (error: any) {
      toast.error(t('errorFetchAdmins') || 'Không thể tải danh sách tài khoản Admin.');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [t]);

  // Tự động gọi khi hook khởi tạo
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, isLoadingAccounts, fetchAccounts };
}