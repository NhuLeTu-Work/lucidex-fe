// src/api/endpoints/verifier.ts
import { apiClient } from '../../api';
import type { RegisterVerifierPayload, RegisterVerifierResponse } from '../../types/verifier.types';

export const registerVerifierApi = async (payload: RegisterVerifierPayload): Promise<RegisterVerifierResponse> => {
  const formData = new FormData();
  
  formData.append('name', payload.name);
  formData.append('tax_code', payload.tax_code);
  formData.append('address', payload.address);
  formData.append('legal_rep_name', payload.legal_rep_name);
  formData.append('contact_email', payload.contact_email);
  formData.append('contact_phone', payload.contact_phone);
  formData.append('registrant_name', payload.registrant_name);
  formData.append('document', payload.document);

  // Gọi endpoint của verifier
  const response = await apiClient.post<RegisterVerifierResponse>('/api/v1/verifier/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};