// src/hooks/super/useAdminAccounts.ts
import { useState } from 'react';
import { createAdminApi } from '../../api/endpoints/super/createAdminApi';
import { toast } from 'sonner';

export function useAdminAccounts(t: any) {
  const [isCreating, setIsCreating] = useState(false);
  const [newAdminCredentials, setNewAdminCredentials] = useState<{ username: string; password: string } | null>(null);

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    try {
      const result = await createAdminApi();
      
      // Lưu lại username và password để truyền vào CreateAdminModal
      setNewAdminCredentials({
        username: result.username,
        password: result.temporary_password
      });

      toast.success(t('createAdminSuccess') || 'Tạo tài khoản Admin thành công!');
      
      // TODO: Nếu bạn có hàm fetch danh sách Admin (fetchAccounts), hãy gọi lại nó ở đây để cập nhật table
      // fetchAccounts(); 

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

  return {
    isCreating,
    newAdminCredentials,
    handleCreateAdmin,
    closeCreateModal
  };
}