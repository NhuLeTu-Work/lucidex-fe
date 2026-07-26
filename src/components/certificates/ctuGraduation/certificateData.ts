// certificateData.ts
// Nơi khai báo kiểu dữ liệu + dữ liệu truyền vào GraduationCertificate.tsx
// Thay đổi nội dung tại đây (hoặc fetch từ API/DB) — KHÔNG cần sửa file .tsx / .css

export interface CertificateSideData {
  major: string;            // Ngành học
  fullName: string;         // Cho ai (Upon / Cho)
  dob: string;              // Ngày sinh
  graduationYear: string;   // Năm tốt nghiệp
  classification: string;   // Xếp loại tốt nghiệp
  studyMode: string;        // Hình thức đào tạo
  regNo: string;            // Số vào sổ
  serialNo: string;         // Số hiệu
  issueDate: string;        // Ngày ký / cấp bằng
  signerTitle: string;      // Chức danh người ký (VD: Rector / Hiệu Trưởng)
  signerName: string;       // Tên người ký
  signatureText: string;    // Chữ ký cách điệu (VD: "Hai")
}

export interface CertificateData {
  en: CertificateSideData;
  vi: CertificateSideData;
  backgroundImage?: string; // Ảnh phôi nền (2 trang ghép), mặc định './template_cred.png'
  logoUrl?: string;         // Logo trường (tuỳ chọn), có thể là base64 hoặc URL
  regNoLabelEn?: string;    // Nhãn tuỳ biến (mặc định "Reg. No:")
  serialNoLabelEn?: string; // (mặc định "Serial No:")
  regNoLabelVi?: string;    // (mặc định "Số vào sổ:")
  serialNoLabelVi?: string; // (mặc định "Số hiệu:")
}

// Dữ liệu mẫu — thay bằng dữ liệu thực tế / kết quả fetch API
export const sampleCertificateData: CertificateData = {
  backgroundImage: "../../../public/ctuGraduation/ctuDiplomaBook.png",
  logoUrl: "../../../public/ctuGraduation/ctuLogo.png",

  en: {
    major: "Information Systems",
    fullName: "Duong Huu Dan",
    dob: "27 May 2004",
    graduationYear: "2026",
    classification: "Excellent",
    studyMode: "Full-time",
    regNo: "CTU-2026-089",
    serialNo: "00230934",
    issueDate: "Can Tho, 30 October 2026",
    signerTitle: "Rector",
    signerName: "Prof. Dr. Tran Ngoc Hai",
    signatureText: "Hai",
  },

  vi: {
    major: "Hệ Thống Thông Tin",
    fullName: "Dương Hữu Đan",
    dob: "27/05/2004",
    graduationYear: "2026",
    classification: "Xuất Sắc",
    studyMode: "Chính quy",
    regNo: "CTU-2026-089",
    serialNo: "00230934",
    issueDate: "Cần Thơ, ngày 30 tháng 10 năm 2026",
    signerTitle: "Hiệu Trưởng",
    signerName: "PGS. TS. Trần Ngọc Hải",
    signatureText: "Hải",
  },
};
