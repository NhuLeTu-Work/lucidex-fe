import { useState } from 'react';
import { createAdminApi } from '@/api/endpoints/super/createAdminApi';
import { toast } from 'sonner';

export function useCreateAdmin(t: any, fetchAccounts: () => Promise<void>) {
  const [isCreating, setIsCreating] = useState(false);
  const [newAdminCredentials, setNewAdminCredentials] = useState<{ username: string; password: string } | null>(null);

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    try {
      const result = await createAdminApi();
      
      setNewAdminCredentials({
        username: result.username,
        password: result.temporary_password
      });

      toast.success(t('createAdminSuccess') || 'Tạo tài khoản Admin thành công!');
      
      // Chờ cập nhật lại danh sách table sau khi tạo xong
      await fetchAccounts();

    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message || t('createAdminError') || 'Lỗi khi tạo tài khoản.');
      } else {
        toast.error('Lỗi kết nối mạng.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const closeCreateModal = () => {
    setNewAdminCredentials(null);
  };

  return { isCreating, newAdminCredentials, handleCreateAdmin, closeCreateModal };
}