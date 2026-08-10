import { apiClient } from '@/api/api';

export interface ImportManualCredentialPayload {
  student_id: string;
  full_name: string;
  dob: string;
  class_id: string;
  graduation_year?: number;
  university_email?: string;
  major?: string;
  classification?: string;
  mode_of_study?: string;
  national_id?: string;
  place_of_birth?: string;
  gender?: string | null;
  faculty?: string;
  specialization?: string;
  cpa?: number | null;
  degree_number?: string;
  register_number?: string;
  degree_type?: string;
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
