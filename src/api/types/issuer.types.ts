export interface RegisterIssuerPayload {
  name: string;
  tax_code: string;
  address: string;
  legal_rep_name: string;
  contact_email: string;
  contact_phone: string;
  registrant_name: string;
  document: File; // Bắt buộc là đối tượng File từ thẻ <input type="file">
}

export interface RegisterIssuerResponse {
  success: boolean;
  data: {
    id: string;
    status: string; // Trạng thái thường là 'pending_review'
  };
  message: string;
  error_code: string;
}