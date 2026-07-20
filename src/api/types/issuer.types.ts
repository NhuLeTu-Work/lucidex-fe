// src/api/types/issuer.ts

// Dữ liệu truyền vào hàm gọi API
export interface RegisterIssuerPayload {
  name: string;
  tax_code: string;
  address: string;
  legal_rep_name: string;
  contact_email: string;
  contact_phone: string;
  registrant_name: string;
  document: File; // Chú ý: Đây là kiểu File từ input type="file"
}

// Cấu trúc dữ liệu trả về từ Backend (Thành công)
export interface RegisterIssuerResponse {
  success: boolean;
  data: {
    id: string;
    status: string; // ví dụ: 'pending_review'
  };
  message: string;
  error_code: string;
}