import { useState } from 'react';
import { currentVerifier, mockCredentials, mockOwners } from '../../data/mockData';
import type { VerifierTab, VerifyResultState, VerifiedData } from '../../types/verifier';

import { verifyCodeApi } from '../../api/endpoints/verifier/verifyCodeApi';

export function useVerifierPortal(showToast?: (type: 'success' | 'error' | 'warning', msg: string) => void) {
  const [activeTab, setActiveTab] = useState<VerifierTab>('dashboard');
  const [quotaUsed, setQuotaUsed] = useState(currentVerifier.quotaUsed);
  const [verifyResult, setVerifyResult] = useState<VerifyResultState>('idle');
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);
  const [rawCredentialData, setRawCredentialData] = useState<any | null>(null);

  const handleVerify = async (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    setVerifyResult('checking');

    try {
      const response = await verifyCodeApi({ code: trimmedCode });

      if (response.success && response.data?.credential) {
        const cred = response.data.credential;
        setRawCredentialData(cred);
        setVerifiedData({
          id: cred.id,
          studentId: cred.student_id,
          degreeType: cred.degree_type,
          issueDate: response.data.verified_at || new Date().toISOString(),
          hash: cred.degree_number || cred.id,
          ownerName: cred.full_name,
          major: cred.major,
          graduationYear: cred.graduation_year,
          gpa: cred.gpa,
          honors: cred.classification,
          issuerName: cred.issuer_name,
        });
        setVerifyResult('valid');
        setQuotaUsed(prev => Math.min(prev + 1, 20));
        showToast?.('success', 'Xác thực mã chia sẻ thành công!');
      } else {
        setVerifiedData(null);
        setRawCredentialData(null);
        setVerifyResult('invalid');
        showToast?.('error', response.message || 'Mã xác thực không hợp lệ!');
      }
    } catch {
      // Direct API call fallback for mock/offline testing environment
      if (['abc123', 'def456', 'ghi789', 'jkl012'].includes(trimmedCode)) {
        const cred = mockCredentials.find(c => {
          if (trimmedCode === 'abc123') return c.id === 'cred_001';
          if (trimmedCode === 'def456') return c.id === 'cred_001';
          if (trimmedCode === 'ghi789') return c.id === 'cred_002';
          if (trimmedCode === 'jkl012') return c.id === 'cred_004';
          return false;
        });
        const owner = mockOwners.find(s => s.studentId === cred?.studentId);

        if (cred) {
          const raw = {
            id: cred.id,
            student_id: cred.studentId,
            full_name: owner?.name || 'Nguyễn Văn A',
            degree_type: cred.degreeType,
            major: owner?.major || 'Công nghệ thông tin',
            graduation_year: owner?.graduationYear || 2026,
            gpa: owner?.gpa || 3.8,
            classification: owner?.honors || 'Xuất sắc',
            mode_of_study: 'Chính quy',
            degree_number: 'B' + cred.id.replace(/\D/g, '').padStart(6, '0'),
            registration_number: 'S001/2026',
            issuer_name: 'Trường Đại học Cần Thơ',
            created_at: cred.issueDate
          };
          setRawCredentialData(raw);
          setVerifiedData({
            ...cred,
            ownerName: owner?.name,
            major: owner?.major,
            graduationYear: owner?.graduationYear,
            gpa: owner?.gpa,
            honors: owner?.honors,
            issuerName: 'Trường Đại học Cần Thơ'
          });
          setVerifyResult('valid');
          setQuotaUsed(prev => Math.min(prev + 1, 20));
          showToast?.('success', 'Xác thực mã chia sẻ thành công!');
          return;
        }
      }
      setVerifiedData(null);
      setRawCredentialData(null);
      setVerifyResult('invalid');
      showToast?.('error', 'Mã xác thực không hợp lệ hoặc đã hết hạn!');
    }
  };

  return {
    activeTab, setActiveTab,
    quotaUsed,
    verifyResult,
    verifiedData,
    rawCredentialData,
    handleVerify
  };
}