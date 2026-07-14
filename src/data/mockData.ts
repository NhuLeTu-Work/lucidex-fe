// MOCK DATA - All data is synthetic for demonstration purposes

export interface Student {
  id: string;
  studentId: string;
  name: string;
  dob: string;
  email: string;
  major: string;
  graduationYear: number;
  gpa: number;
  honors: string;
  activated: boolean;
}

export interface Credential {
  id: string;
  studentId: string;
  degreeType: string;
  issueDate: string;
  status: 'active' | 'revoked';
  hash: string;
}

export interface VerifiedLink {
  id: string;
  credentialId: string;
  url: string;
  expiry: string;
  expiryLabel: string;
  consentType: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  revokedAt?: string;
}

export interface AuditEntry {
  id: string;
  credentialId: string;
  verifiedBy: string;
  organization: string;
  timestamp: string;
  status: 'success' | 'failed';
  ipAddress: string;
}

export interface ReviewItem {
  id: string;
  studentName: string;
  studentId: string;
  method: 'email_otp' | 'cccd_ocr';
  confidenceScore: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface HROrganization {
  id: string;
  name: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  licenseFile?: string;
}

export interface HRVerifyEntry {
  id: string;
  credentialId: string;
  studentName: string;
  institution: string;
  major: string;
  result: 'valid' | 'invalid';
  timestamp: string;
  method: 'link' | 'portal';
}

// Thêm registrationData vào interface Account
export interface Account {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'issuer' | 'hr' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'setup_required' | 'rejected';
  createdAt: string;
  lastActive: string;
  registrationData?: {
    orgName: string;
    taxCode: string;
    address: string;
    legalRep: string;
    contactPhone: string;
    regName: string;
    regTitle?: string;
    submittedAt: string;
    rejectedReason?: string;
  };
}

// Thay thế mảng mockAccounts hiện tại bằng mảng này để có đủ 6 tài khoản Issuer/Verifier test các trạng thái
export const mockAccounts: Account[] = [
  // 1. TÀI KHOẢN ADMIN & STUDENT (Active bình thường)
  { id: 'acc_001', name: 'System Admin', email: 'admin@lucidex.vn', type: 'admin', status: 'active', createdAt: '2026-01-01T00:00:00Z', lastActive: '2026-06-17T09:00:00Z' },
  { id: 'acc_002', name: 'Nguyen Van A', email: 'b190001@student.ctu.edu.vn', type: 'student', status: 'active', createdAt: '2026-03-01T00:00:00Z', lastActive: '2026-06-16T20:00:00Z' },

  { id: 'iss_004', name: 'Phong Dao tao CICT', email: 'daotao@cict.ctu.edu.vn', type: 'issuer', status: 'active', createdAt: '2026-01-15T00:00:00Z', lastActive: '2026-06-17T08:00:00Z' },
  { id: 'hr_004', name: 'Tran Thi HR', email: 'hr@tma.com.vn', type: 'hr', status: 'active', createdAt: '2026-04-10T00:00:00Z', lastActive: '2026-06-15T14:00:00Z' },
  { id: 'hr_005', name: 'FPT Software HR', email: 'hr@fptsoftware.ct', type: 'hr', status: 'inactive', createdAt: '2026-06-16T00:00:00Z', lastActive: '2026-06-16T08:00:00Z' },
  // 2. ISSUER (3 Trạng thái)
  { 
    id: 'iss_001', name: 'ĐH Cần Thơ (Pending)', email: 'pending@ctu.edu.vn', type: 'issuer', status: 'pending', createdAt: '2026-07-09T00:00:00Z', lastActive: '',
    registrationData: { orgName: 'Đại học Cần Thơ', taxCode: '1800156840', address: 'Khu II, Đ. 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ', legalRep: 'Tran Viet Truong', contactPhone: '02923832663', regName: 'Nguyen Van Issuer', submittedAt: '2026-07-09T14:30:00Z' }
  },
  { 
    id: 'iss_002', name: 'ĐH Cần Thơ (Approved)', email: 'approved@ctu.edu.vn', type: 'issuer', status: 'setup_required', createdAt: '2026-07-08T00:00:00Z', lastActive: '',
    registrationData: { orgName: 'Đại học Cần Thơ', taxCode: '1800156840', address: 'Khu II, Đ. 3/2, Xuân Khánh, Cần Thơ', legalRep: 'Tran Viet Truong', contactPhone: '02923832663', regName: 'Nguyen Van Issuer', submittedAt: '2026-07-08T09:00:00Z' }
  },
  { 
    id: 'iss_003', name: 'ĐH Cần Thơ (Rejected)', email: 'rejected@ctu.edu.vn', type: 'issuer', status: 'rejected', createdAt: '2026-07-07T00:00:00Z', lastActive: '',
    registrationData: { orgName: 'Đại học Cần Thơ Fake', taxCode: '0000000000', address: 'Địa chỉ giả', legalRep: 'Kẻ mạo danh', contactPhone: '0123456789', regName: 'Scammer', submittedAt: '2026-07-07T10:00:00Z', rejectedReason: 'Mã số thuế không tồn tại trên hệ thống Đăng ký kinh doanh Quốc gia.' }
  },

  // 3. VERIFIER / HR (3 Trạng thái)
  { 
    id: 'hr_001', name: 'FPT Software (Pending)', email: 'pending@fpt.com', type: 'hr', status: 'pending', createdAt: '2026-07-09T00:00:00Z', lastActive: '',
    registrationData: { orgName: 'FPT Software Can Tho', taxCode: '0302161475', address: 'Số 1, Đường D1, Khu CNC', legalRep: 'Hoang Nam', contactPhone: '0901234567', regName: 'Le Thi HR', regTitle: 'HR Manager', submittedAt: '2026-07-09T15:00:00Z' }
  },
  { 
    id: 'hr_002', name: 'FPT Software (Approved)', email: 'approved@fpt.com', type: 'hr', status: 'setup_required', createdAt: '2026-07-08T00:00:00Z', lastActive: '',
    registrationData: { orgName: 'FPT Software Can Tho', taxCode: '0302161475', address: 'Số 1, Đường D1, Khu CNC', legalRep: 'Hoang Nam', contactPhone: '0901234567', regName: 'Le Thi HR', regTitle: 'HR Manager', submittedAt: '2026-07-08T11:00:00Z' }
  },
  { 
    id: 'hr_003', name: 'FPT Software (Rejected)', email: 'rejected@fpt.com', type: 'hr', status: 'rejected', createdAt: '2026-07-07T00:00:00Z', lastActive: '',
    registrationData: { orgName: 'Công ty Ma', taxCode: '9999999999', address: 'Không rõ', legalRep: 'Vô danh', contactPhone: '0999999999', regName: 'Hacker', regTitle: 'Boss', submittedAt: '2026-07-07T14:00:00Z', rejectedReason: 'Giấy phép kinh doanh tải lên bị mờ, không thể xác thực thông tin pháp lý.' }
  },
];

// Mock Students
export const mockStudents: Student[] = [
  { id: '1', studentId: 'B190001', name: 'Nguyen Van A', dob: '2001-05-15', email: 'b190001@student.ctu.edu.vn', major: 'Computer Science', graduationYear: 2024, gpa: 3.6, honors: 'Very Good', activated: true },
  { id: '2', studentId: 'B190002', name: 'Tran Thi B', dob: '2000-08-22', email: 'b190002@student.ctu.edu.vn', major: 'Software Engineering', graduationYear: 2024, gpa: 3.8, honors: 'Excellent', activated: true },
  { id: '3', studentId: 'B190003', name: 'Le Van C', dob: '2001-02-10', email: 'b190003@student.ctu.edu.vn', major: 'Information Systems', graduationYear: 2023, gpa: 3.2, honors: 'Good', activated: false },
  { id: '4', studentId: 'B190004', name: 'Pham Thi D', dob: '2000-11-30', email: 'b190004@student.ctu.edu.vn', major: 'Computer Science', graduationYear: 2024, gpa: 3.9, honors: 'Excellent', activated: true },
  { id: '5', studentId: 'B190005', name: 'Hoang Van E', dob: '2001-07-08', email: '', major: 'Network Engineering', graduationYear: 2023, gpa: 3.4, honors: 'Good', activated: false },
];

// Mock Credentials
export const mockCredentials: Credential[] = [
  { id: 'cred_001', studentId: 'B190001', degreeType: 'Bachelor of Computer Science', issueDate: '2024-06-15', status: 'active', hash: '0x7f8a9b...2c3d4e' },
  { id: 'cred_002', studentId: 'B190002', degreeType: 'Bachelor of Software Engineering', issueDate: '2024-06-15', status: 'active', hash: '0x8g9b0c...3d4e5f' },
  { id: 'cred_003', studentId: 'B190003', degreeType: 'Bachelor of Information Systems', issueDate: '2023-06-20', status: 'active', hash: '0x9h0c1d...4e5f6g' },
  { id: 'cred_004', studentId: 'B190004', degreeType: 'Bachelor of Computer Science', issueDate: '2024-06-15', status: 'active', hash: '0x0i1d2e...5f6g7h' },
];

// Mock Verified Links
export const mockVerifiedLinks: VerifiedLink[] = [
  { id: 'link_001', credentialId: 'cred_001', url: 'https://credentwin.ctu.edu.vn/v/abc123', expiry: '2026-06-24T10:00:00Z', expiryLabel: '7d', consentType: 'one_time', status: 'active', createdAt: '2026-06-17T10:00:00Z' },
  { id: 'link_002', credentialId: 'cred_001', url: 'https://credentwin.ctu.edu.vn/v/def456', expiry: '2026-06-18T10:00:00Z', expiryLabel: '24h', consentType: 'per_request', status: 'active', createdAt: '2026-06-17T10:00:00Z' },
  { id: 'link_003', credentialId: 'cred_002', url: 'https://credentwin.ctu.edu.vn/v/ghi789', expiry: '2025-12-31T23:59:59Z', expiryLabel: '30d', consentType: 'org_level', status: 'revoked', createdAt: '2026-05-01T10:00:00Z', revokedAt: '2026-05-15T10:00:00Z' },
  { id: 'link_004', credentialId: 'cred_004', url: 'https://credentwin.ctu.edu.vn/v/jkl012', expiry: '2099-12-31T23:59:59Z', expiryLabel: 'permanent', consentType: 'time_bound', status: 'active', createdAt: '2026-06-01T10:00:00Z' },
];

// Mock Audit Log
export const mockAuditLog: AuditEntry[] = [
  { id: 'audit_001', credentialId: 'cred_001', verifiedBy: 'FPT Software', organization: 'FPT Software Can Tho', timestamp: '2026-06-15T09:30:00Z', status: 'success', ipAddress: '203.162.**.*' },
  { id: 'audit_002', credentialId: 'cred_001', verifiedBy: 'Viettel', organization: 'Viettel Can Tho', timestamp: '2026-06-14T14:20:00Z', status: 'success', ipAddress: '203.162.**.*' },
  { id: 'audit_003', credentialId: 'cred_002', verifiedBy: 'TMA Solutions', organization: 'TMA Solutions', timestamp: '2026-06-13T11:00:00Z', status: 'success', ipAddress: '203.191.**.*' },
  { id: 'audit_004', credentialId: 'cred_001', verifiedBy: 'iOffice', organization: 'iOffice Can Tho', timestamp: '2026-06-10T16:45:00Z', status: 'failed', ipAddress: '118.69.**.*' },
  { id: 'audit_005', credentialId: 'cred_004', verifiedBy: 'FPT Software', organization: 'FPT Software Can Tho', timestamp: '2026-06-09T08:15:00Z', status: 'success', ipAddress: '203.162.**.*' },
  { id: 'audit_006', credentialId: 'cred_002', verifiedBy: 'VNG Corporation', organization: 'VNG Corp', timestamp: '2026-06-08T13:30:00Z', status: 'success', ipAddress: '125.212.**.*' },
];

// Mock Review Queue
export const mockReviewQueue: ReviewItem[] = [
  { id: 'review_001', studentName: 'Hoang Van E', studentId: 'B190005', method: 'cccd_ocr', confidenceScore: 0.72, submittedAt: '2026-06-16T10:00:00Z', status: 'pending' },
  { id: 'review_002', studentName: 'Nguyen Thi F', studentId: 'B190006', method: 'cccd_ocr', confidenceScore: 0.65, submittedAt: '2026-06-15T14:30:00Z', status: 'pending' },
  { id: 'review_003', studentName: 'Tran Van G', studentId: 'B190007', method: 'email_otp', confidenceScore: 0.91, submittedAt: '2026-06-14T09:00:00Z', status: 'approved' },
];

// Mock HR Organizations
export const mockOrganizations: HROrganization[] = [
  { id: 'org_001', name: 'FPT Software Can Tho', taxId: '0302161475', contactName: 'Nguyen Thi HR', contactEmail: 'hr@fptsoftware.ct', status: 'pending', submittedAt: '2026-06-16T08:00:00Z', licenseFile: 'business_license_fpt.pdf' },
  { id: 'org_002', name: 'TMA Solutions', taxId: '0302538231', contactName: 'Tran Van HR', contactEmail: 'hr@tma.com.vn', status: 'approved', submittedAt: '2026-06-10T10:00:00Z', licenseFile: 'business_license_tma.pdf' },
  { id: 'org_003', name: 'Viettel Can Tho', taxId: '0100109108', contactName: 'Le Thi HR', contactEmail: 'hr@viettel.ct', status: 'pending', submittedAt: '2026-06-15T14:00:00Z', licenseFile: 'business_license_viettel.pdf' },
  { id: 'org_004', name: 'iOffice', taxId: '0314394521', contactName: 'Pham Van HR', contactEmail: 'hr@ioffice.vn', status: 'rejected', submittedAt: '2026-06-12T09:00:00Z', licenseFile: 'business_license_ioffice.pdf' },
];

// Mock HR Verify History
export const mockHRVerifyHistory: HRVerifyEntry[] = [
  { id: 'hrv_001', credentialId: 'cred_001', studentName: 'Nguyen Van A', institution: 'CICT - Can Tho University', major: 'Computer Science', result: 'valid', timestamp: '2026-06-15T09:30:00Z', method: 'link' },
  { id: 'hrv_002', credentialId: 'cred_002', studentName: 'Tran Thi B', institution: 'CICT - Can Tho University', major: 'Software Engineering', result: 'valid', timestamp: '2026-06-14T14:20:00Z', method: 'portal' },
  { id: 'hrv_003', credentialId: 'cred_004', studentName: 'Pham Thi D', institution: 'CICT - Can Tho University', major: 'Computer Science', result: 'valid', timestamp: '2026-06-09T08:15:00Z', method: 'portal' },
  { id: 'hrv_004', credentialId: 'cred_001', studentName: 'Nguyen Van A', institution: 'CICT - Can Tho University', major: 'Computer Science', result: 'valid', timestamp: '2026-06-08T11:00:00Z', method: 'link' },
];

// Analytics Data
export const monthlyVerifications = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 25 },
  { month: 'Apr', count: 32 },
  { month: 'May', count: 45 },
  { month: 'Jun', count: 58 },
];

export const topEmployers = [
  { name: 'FPT Software', count: 28 },
  { name: 'TMA Solutions', count: 22 },
  { name: 'Viettel', count: 18 },
  { name: 'VNG Corp', count: 12 },
  { name: 'iOffice', count: 8 },
];

export const topMajors = [
  { name: 'Computer Science', count: 35 },
  { name: 'Software Engineering', count: 28 },
  { name: 'Information Systems', count: 20 },
  { name: 'Network Engineering', count: 15 },
  { name: 'Data Science', count: 10 },
];

// Current logged in user (mock)
export const currentStudent = mockStudents[0];
export const currentIssuer = { name: 'Phong Dao tao CICT', email: 'daotao@cict.ctu.edu.vn', role: 'issuer_admin' };
export const currentHR = { name: 'Tran Thi HR', email: 'hr@tma.com.vn', company: 'TMA Solutions', quotaUsed: 14, quotaTotal: 20 };
export const currentAdmin = { name: 'System Admin', email: 'admin@credentwin.vn' };
