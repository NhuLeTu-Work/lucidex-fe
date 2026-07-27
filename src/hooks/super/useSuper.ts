import { useGetAdmins } from './useGetAdmins';
import { useCreateAdmin } from './useCreateAdmin';
import { useAdminResetRequests } from './useGetAdminResetRequest';
import { useProcessAdminRequest } from './useProcessAdminRequest';

export function useSuper(showToast: (type: 'success' | 'error' | 'warning', message: string) => void) {
  // 1. Danh sách admin
  const { accounts, isLoadingAccounts, fetchAccounts } = useGetAdmins(showToast);

  // 2. Tạo admin
  const { isCreating, newAdminCredentials, handleCreateAdmin, closeCreateModal } = useCreateAdmin(fetchAccounts, showToast);

  // 3. Danh sách request reset (password/totp) từ các admin
  const { requests, isLoading: isLoadingRequests, errorKey: requestsErrorKey, refetch: refetchRequests } = useAdminResetRequests(showToast);

  // 4. Xử lý approve/reject request reset
  const {
    isProcessing,
    credentialData,
    processApproval,
    clearCredentialData,
    handleRejectTotp,
    handleRejectPassword,
    isRejectingId,
  } = useProcessAdminRequest(showToast);

  // Wrapper: approve xong thì load lại cả accounts (totpEnabled có thể đổi) lẫn requests
  const handleApproveRequest = async (id: string, type: 'password' | 'totp') => {
    const result = await processApproval(id, type);
    if (result.success) {
      showToast('success', type === 'password' ? 'approvePasswordSuccess' : 'approveTotpSuccess');
      await Promise.all([fetchAccounts(), refetchRequests()]);
    } else {
      showToast('error', 'errorActionFailed');
    }
    return result.success;
  };

  // Wrapper: reject xong thì load lại requests
  const handleRejectRequest = async (id: string, type: 'password' | 'totp') => {
    const success = type === 'password' ? await handleRejectPassword(id) : await handleRejectTotp(id);
    if (success) await refetchRequests();
    return success;
  };

  return {
    // Danh sách + tạo admin
    accounts,
    isLoadingAccounts,
    fetchAccounts,
    isCreating,
    newAdminCredentials,
    handleCreateAdmin,
    closeCreateModal,

    // Reset requests (approve/reject)
    requests,
    isLoadingRequests,
    requestsErrorKey,
    refetchRequests,
    isProcessing,
    credentialData,
    clearCredentialData,
    isRejectingId,
    handleApproveRequest,
    handleRejectRequest,
  };
}