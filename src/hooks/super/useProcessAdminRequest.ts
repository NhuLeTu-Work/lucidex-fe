import { useState } from 'react';
import { superAdminRequestsApi } from '../../api/endpoints/super/approveResetRequestApi';
import type { ResetPasswordResponse } from '../../api/types/super.types';
import { rejectTotpResetApi, rejectPasswordResetApi } from '@/api/endpoints/super/rejectResetRequestApi';

export function useProcessAdminRequest(showToast: (type: 'success' | 'error' | 'warning', message: string) => void
) {
  const [isRejectingId, setIsRejectingId] = useState<string | null>(null);const [isProcessing, setIsProcessing] = useState(false);
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
  // Xử lý từ chối Reset TOTP
  const handleRejectTotp = async (id: string): Promise<boolean> => {
    setIsRejectingId(`totp-${id}`);
    try {
      await rejectTotpResetApi(id);
      showToast('success', 'rejectTotpSuccess');
      return true; // Trả về true để Component cha reload lại danh sách
    } catch (error: any) {
      handleApiError(error.response?.status);
      return false;
    } finally {
      setIsRejectingId(null);
    }
  };

  // Xử lý từ chối Reset Password
  const handleRejectPassword = async (id: string): Promise<boolean> => {
    setIsRejectingId(`pwd-${id}`);
    try {
      await rejectPasswordResetApi(id);
      showToast('success', 'rejectPasswordSuccess');
      return true;
    } catch (error: any) {
      handleApiError(error.response?.status);
      return false;
    } finally {
      setIsRejectingId(null);
    }
  };

  // Hàm helper xử lý mã lỗi chung
  const handleApiError = (status?: number) => {
    if (status === 401) {
      showToast('error', 'errorAdminSession');
    } else if (status === 404) {
      showToast('error', 'errorAccountNotFound');
    } else if (status === 422) {
      showToast('error', 'errorInvalidRequestData');
    } else {
      showToast('error', 'errorActionFailed');
    }
  };

  // Hàm Helper: Kiểm tra xem request có hợp lệ không (cách đây chưa quá 24h)
  // Dành cho UI Super Admin nếu muốn highlight các request đã quá cũ
  const isRequestValid = (requestedAt: string | null) => {
    if (!requestedAt) return false;
    const requestTime = new Date(requestedAt).getTime();
    const now = new Date().getTime();
    const hoursDifference = (now - requestTime) / (1000 * 60 * 60);
    return hoursDifference <= 24; 
  };

  const clearCredentialData = () => setCredentialData(null);

  return {
    isProcessing,
    credentialData,
    processApproval,
    processRejection,
    clearCredentialData,
    handleRejectTotp,
    handleRejectPassword,
    isRejectingId,
    isRequestValid
  };
}