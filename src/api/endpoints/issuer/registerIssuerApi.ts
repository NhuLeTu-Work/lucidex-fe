// src/api/endpoints/issuer/registerIssuerApi.ts
import { apiClient } from '../../api';
import type { RegisterIssuerPayload, RegisterIssuerResponse } from '../../types/issuer.types';

export const registerIssuerApi = async (payload: RegisterIssuerPayload): Promise<RegisterIssuerResponse> => {
  // 1. Khởi tạo FormData
  const formData = new FormData();
  
  // 2. Nạp dữ liệu vào FormData
  formData.append('name', payload.name);
  formData.append('tax_code', payload.tax_code);
  formData.append('address', payload.address);
  formData.append('legal_rep_name', payload.legal_rep_name);
  formData.append('contact_email', payload.contact_email);
  formData.append('contact_phone', payload.contact_phone);
  formData.append('registrant_name', payload.registrant_name);
  formData.append('document', payload.document); 

  // 3. Gửi Request với header multipart/form-data
  const response = await apiClient.post<RegisterIssuerResponse>('/api/v1/issuer/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};