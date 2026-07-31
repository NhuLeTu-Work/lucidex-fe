export interface CredentialItem {
  id: string;
  student_id: string;
  class_id: string;
  full_name: string;
  graduation_year: number;
  status: 'claimed' | 'unclaimed';
  claimed_at: string | null;
  created_at: string;
  // Các field extra cho detail (API list có thể không trả về, nhưng detail sẽ có)
  dob?: string;
  major_vi?: string;
  major_en?: string;
  graduation_classification_vi?: string;
  graduation_classification_en?: string;
  mode_of_study_vi?: string;
  mode_of_study_en?: string;
  university_email?: string;
}

export interface CredentialSummary {
  total_credentials: number;
  total_claimed: number;
  total_unclaimed: number;
}

export interface CredentialListResponse {
  summary: CredentialSummary;
  items: CredentialItem[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface CredentialFilterParams {
  student_id?: string;
  class_id?: string;
  graduation_year?: string;
  status?: string[];
  search?: string;
  sort?: string;
  page: number;
  limit: number;
}