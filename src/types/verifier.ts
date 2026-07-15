export type VerifierTab = 'dashboard' | 'history' | 'quota' | 'verify' | 'register';
export type VerifyResultState = 'idle' | 'checking' | 'valid' | 'invalid';

// Interface kết hợp dữ liệu Bằng cấp và Chủ sở hữu (Loại bỏ any)
export interface VerifiedData {
  id: string;
  studentId: string;
  degreeType: string;
  issueDate: string;
  hash: string;
  ownerName?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  honors?: string;
}