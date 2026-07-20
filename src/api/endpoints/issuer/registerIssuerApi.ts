// src/api/endpoints/issuer.ts
import { apiClient } from '@/api/api'; 
import type { RegisterIssuerPayload, RegisterIssuerResponse } from '../../types/issuer.types';

export const registerIssuerApi = async (payload: RegisterIssuerPayload): Promise<RegisterIssuerResponse> => {
  // Bắt buộc phải dùng FormData cho multipart/form-data
  const formData = new FormData();
  
  formData.append('name', payload.name);
  formData.append('tax_code', payload.tax_code);
  formData.append('address', payload.address);
  formData.append('legal_rep_name', payload.legal_rep_name);
  formData.append('contact_email', payload.contact_email);
  formData.append('contact_phone', payload.contact_phone);
  formData.append('registrant_name', payload.registrant_name);
  formData.append('document', payload.document);

  // Gửi POST request
  const response = await apiClient.post<RegisterIssuerResponse>('/api/v1/issuer/register', formData, {
    headers: {
      // Axios thường tự động set Content-Type là multipart/form-data khi nhận vào FormData,
      // nhưng khai báo rõ ra để code tường minh hơn.
      'Content-Type': 'multipart/form-data', 
    },
  });

  return response.data;
};