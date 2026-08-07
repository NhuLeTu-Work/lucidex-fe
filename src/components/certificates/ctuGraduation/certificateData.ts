import { formatDateDDMMYYYY } from '@/utils/timeUtils';

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
  backgroundImage?: string; // Ảnh phôi nền (2 trang ghép)
  logoUrl?: string;         // Logo trường (tuỳ chọn)
  regNoLabelEn?: string;    // Nhãn tuỳ biến (mặc định "Reg. No:")
  serialNoLabelEn?: string; // (mặc định "Serial No:")
  regNoLabelVi?: string;    // (mặc định "Số vào sổ:")
  serialNoLabelVi?: string; // (mặc định "Số hiệu:")
}

export interface CTUGraduationCertificateData extends CertificateSideData {}

export interface CTUGraduationCertificatePackage extends CertificateData {}

export const sampleCertificateData: CertificateData = {
  backgroundImage: "/ctuGraduation/ctuDiplomaBook-Web.png",
  logoUrl: "/ctuGraduation/ctuLogo.png",

  en: {
    major: "Information Systems",
    fullName: "Duong Huu Dan",
    dob: "27/05/2004",
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

export const getCTUGraduationCertificateData = (detail: any): CertificateData => {
  if (!detail) return sampleCertificateData;

  const parseDate = (val: any): Date => {
    if (!val) return new Date();
    if (typeof val === 'object' && val.$date) return new Date(val.$date);
    return new Date(val);
  };

  const parseDobString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'object' && val.$date) {
      val = val.$date;
    }
    const str = String(val);
    if (str.includes('T')) {
      return str.split('T')[0];
    }
    return str;
  };

  const createdDate = parseDate(detail.created_at);
  const dobFormatted = formatDateDDMMYYYY(parseDobString(detail.dob));

  const formattedEnDate = `Can Tho, ${createdDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const formattedViDate = `Cần Thơ, ngày ${createdDate.getDate()} tháng ${createdDate.getMonth() + 1} năm ${createdDate.getFullYear()}`;

  const idStr = typeof detail.id === 'object' && detail.id?.$oid
    ? detail.id.$oid
    : String(detail.id || detail._id || '');

  return {
    backgroundImage: "/ctuGraduation/ctuDiplomaBook-Web.png",
    logoUrl: "/ctuGraduation/ctuLogo.png",

    en: {
      major: detail.major_en || detail.major || detail.major_vi || '',
      fullName: detail.full_name || '',
      dob: dobFormatted,
      graduationYear: String(detail.graduation_year || ''),
      classification: detail.graduation_classification_en || detail.classification || detail.graduation_classification_vi || '',
      studyMode: detail.mode_of_study_en || detail.mode_of_study_vi || '',
      regNo: detail.student_id ? `CTU-${detail.graduation_year}-${detail.student_id}` : 'CTU-2026-089',
      serialNo: idStr ? idStr.slice(-8).toUpperCase() : '00230934',
      issueDate: formattedEnDate,
      signerTitle: "Rector",
      signerName: "Prof. Dr. Tran Ngoc Hai",
      signatureText: "Hai",
    },

    vi: {
      major: detail.major_vi || detail.major || detail.major_en || '',
      fullName: detail.full_name || '',
      dob: dobFormatted,
      graduationYear: String(detail.graduation_year || ''),
      classification: detail.graduation_classification_vi || detail.classification || detail.graduation_classification_en || '',
      studyMode: detail.mode_of_study_vi || detail.mode_of_study_en || '',
      regNo: detail.student_id ? `CTU-${detail.graduation_year}-${detail.student_id}` : 'CTU-2026-089',
      serialNo: idStr ? idStr.slice(-8).toUpperCase() : '00230934',
      issueDate: formattedViDate,
      signerTitle: "Hiệu Trưởng",
      signerName: "PGS. TS. Trần Ngọc Hải",
      signatureText: "Hải",
    },
  };
};

export const mapOwnerCredentialToCertificateData = getCTUGraduationCertificateData;
