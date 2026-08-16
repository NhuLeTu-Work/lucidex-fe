import { apiClient } from '../../api';
import type { BulkVerifyResponse } from '../../types/verifier.types';

export const bulkVerifyApi = async (file: File): Promise<BulkVerifyResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<BulkVerifyResponse>(
    '/api/v1/verifier/verified-links/bulk-verify',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
