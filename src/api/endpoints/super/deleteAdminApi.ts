import { apiClient } from '../../api';

export const deleteAdminApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/accounts/${id}`);
};