import { apiClient } from "@/api/api";

export interface CredentialDetailData {
  id: string;
  student_id: string;
  class_id: string;
  full_name: string;
  dob: string;
  major_vi: string;
  major_en: string;
  graduation_year: number;
  graduation_classification_vi: string;
  graduation_classification_en: string;
  mode_of_study_vi: string;
  mode_of_study_en: string;
  university_email: string;
  status: 'claimed' | 'unclaimed';
  claimed_at: string | null;
  created_at: string;
}

export interface GetCredentialDetailApiResponse {
  success: boolean;
  data: CredentialDetailData;
  message: string;
  error_code: string | null;
}

export const getCredentialDetailApi = async (
  credentialId: string
): Promise<GetCredentialDetailApiResponse> => {
  const response = await apiClient.get<GetCredentialDetailApiResponse>(
    `/api/v1/issuer/credentials/${credentialId}`
  );

  return response.data;
};
