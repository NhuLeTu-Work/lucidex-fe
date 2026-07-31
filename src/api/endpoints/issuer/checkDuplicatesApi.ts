import { apiClient } from "@/api/api";

export interface DuplicateRecordItem {
  row_number: number;
  student_id: string;
  class_code: string;
  existing: Record<string, any>;
  incoming: Record<string, any>;
}

export interface CheckDuplicatesResponseData {
  total_rows: number;
  has_duplicates: boolean;
  duplicate_count: number;
  duplicates: DuplicateRecordItem[];
  duplicate_ratio?: number;
}

export interface CheckDuplicatesApiResponse {
  success: boolean;
  data: CheckDuplicatesResponseData;
  message: string;
  error_code: string | null;
}

export const checkDuplicatesApi = async (file: File): Promise<CheckDuplicatesApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<CheckDuplicatesApiResponse>(
    '/api/v1/issuer/credentials/check-duplicates',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
