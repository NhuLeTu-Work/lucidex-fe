import { useState } from 'react';
import { superAdminRequestsApi } from '../../api/endpoints/super/approveResetRequestApi';
import type { ResetPasswordResponse } from '../../api/types/super.types';

export function useProcessAdminRequest() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentialData, setCredentialData] = useState<ResetPasswordResponse | null>(null);

  const processApproval = async (id: string, type: 'password' | 'totp') => {
    setIsProcessing(true);
    try {
      if (type === 'password') {
        const data = await superAdminRequestsApi.approvePasswordReset(id);
        setCredentialData(data); // Kích hoạt hiển thị Component Credential
      } else {
        await superAdminRequestsApi.approveTotpReset(id);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, errorKey: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const processRejection = async (id: string, type: 'password' | 'totp') => {
    setIsProcessing(true);
    try {
      await superAdminRequestsApi.rejectRequest(id, type);
      return { success: true };
    } catch (error: any) {
      return { success: false, errorKey: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const clearCredentialData = () => setCredentialData(null);

  return {
    isProcessing,
    credentialData,
    processApproval,
    processRejection,
    clearCredentialData
  };
}