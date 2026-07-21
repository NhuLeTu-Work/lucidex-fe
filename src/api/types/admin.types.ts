export interface LoginAdminPayload {
  username: string;
  password: string;
}

export interface LoginAdminResponse {
  success: boolean;
  data: {
    requires_totp_setup: boolean; // true nếu chưa cài Google Auth
    requires_totp: boolean;       // true nếu đã cài, cần nhập mã
    setup_token?: string;         // Dùng khi setup
    challenge_token?: string;     // Dùng khi verify
    totp_uri?: string;
    manual_entry_key?: string;    // Mã thủ công (nếu không quét được QR)
    qr_code?: string;             // Ảnh QR Code dạng base64 hoặc URL
  };
  message: string;
  error_code: string;
}

export interface VerifyAdminTotpLoginPayload {
  challenge_token: string;
  otp_code: string;
}

export interface VerifyAdminTotpLoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
  };
  message: string;
  error_code: string;
}

export interface VerifyTotpSetupPayload {
  setup_token: string;
  otp_code: string;
}

export interface VerifyTotpSetupResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
  };
  message: string;
  error_code: string;
}