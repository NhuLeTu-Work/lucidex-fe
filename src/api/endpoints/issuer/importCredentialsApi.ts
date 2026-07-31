import { apiClient } from "@/api/api";

export interface ImportCredentialsPayload {
  file: File;
  overwrite_all: boolean;
}

export interface ImportCredentialsResponseData {
  total_received: number;
  created_count: number;
  updated_count: number;
  skipped_count: number;
  storage_path: string;
}

export interface ImportCredentialsApiResponse {
  success: boolean;
  data: ImportCredentialsResponseData;
  message: string;
  error_code: string | null;
}

export const importCredentialsApi = async (
  payload: ImportCredentialsPayload
): Promise<ImportCredentialsApiResponse> => {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('overwrite_all', String(payload.overwrite_all));

  const response = await apiClient.post<ImportCredentialsApiResponse>(
    '/api/v1/issuer/credentials/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
