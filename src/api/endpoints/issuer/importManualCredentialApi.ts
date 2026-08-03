import { apiClient } from '@/api/api';

export interface ImportManualCredentialPayload {
  student_id: string;
  full_name: string;
  dob: string;
  graduation_year: number;
  university_email: string;
  major_vi?: string;
  major_en?: string;
  graduation_classification_vi?: string;
  graduation_classification_en?: string;
  mode_of_study_vi?: string;
  mode_of_study_en?: string;
  class_id?: string;
  national_id_hash?: string;
  phone?: string;
  overwrite?: boolean;
}

export interface ImportManualCredentialResponseData {
  id: string;
  student_id: string;
  full_name: string;
  status: string;
  action: 'created' | 'updated';
}

export interface ImportManualCredentialApiResponse {
  success: boolean;
  data: ImportManualCredentialResponseData;
  message: string;
  error_code: string | null;
}

export const importManualCredentialApi = async (
  payload: ImportManualCredentialPayload
): Promise<ImportManualCredentialApiResponse> => {
  const response = await apiClient.post<ImportManualCredentialApiResponse>(
    '/api/v1/issuer/credentials/manual',
    payload
  );
  return response.data;
};
