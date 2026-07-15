import { useState } from 'react';
import { currentVerifier, mockCredentials, mockOwners } from '../../data/mockData';
import type { VerifierTab, VerifyResultState, VerifiedData } from '../../types/verifier';

export function useVerifierPortal() {
  const [activeTab, setActiveTab] = useState<VerifierTab>('dashboard');
  const [quotaUsed, setQuotaUsed] = useState(currentVerifier.quotaUsed);
  const [verifyResult, setVerifyResult] = useState<VerifyResultState>('idle');
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);

  const handleVerify = (code: string) => {
    setVerifyResult('checking');
    
    setTimeout(() => {
      if (['abc123', 'def456', 'ghi789', 'jkl012'].includes(code.trim())) {
        const cred = mockCredentials.find(c => {
          if (code.trim() === 'abc123') return c.id === 'cred_001';
          if (code.trim() === 'def456') return c.id === 'cred_001';
          if (code.trim() === 'ghi789') return c.id === 'cred_002';
          if (code.trim() === 'jkl012') return c.id === 'cred_004';
          return false;
        });
        const owner = mockOwners.find(s => s.studentId === cred?.studentId);
        
        if (cred) {
          setVerifiedData({
            ...cred,
            ownerName: owner?.name,
            major: owner?.major,
            graduationYear: owner?.graduationYear,
            gpa: owner?.gpa,
            honors: owner?.honors
          });
          setVerifyResult('valid');
          setQuotaUsed(prev => Math.min(prev + 1, 20));
        } else {
          setVerifyResult('invalid');
        }
      } else {
        setVerifyResult('invalid');
      }
    }, 1500);
  };

  return {
    activeTab, setActiveTab,
    quotaUsed,
    verifyResult,
    verifiedData,
    handleVerify
  };
}