import { useState } from 'react';
import { createAdminApi } from '@/api/endpoints/super/createAdminApi';

export function useCreateAdmin(
  fetchAccounts: () => Promise<void>,
  showToast: (
  type: 'success' | 'error' | 'warning',
  messageKey: string
) => void
) {
  const [isCreating, setIsCreating] = useState(false);

  const [newAdminCredentials, setNewAdminCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const handleCreateAdmin = async () => {
    setIsCreating(true);

    try {
      const result = await createAdminApi();

      setNewAdminCredentials({
        username: result.username,
        password: result.temporary_password,
      });

      showToast('success', 'createAdminSuccess');

      // Chờ cập nhật lại danh sách table sau khi tạo xong
      await fetchAccounts();
    } catch (error: any) {
      if (error.response) {
        showToast(
          'error',
          error.response.data.message || 'createAdminError'
        );
      } else {
        showToast('error', 'networkError');
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
    closeCreateModal,
  };
}