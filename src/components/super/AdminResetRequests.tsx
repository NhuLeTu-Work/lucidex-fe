import { Check, X, AlertCircle } from 'lucide-react';
import { useAdminResetRequests } from '@/hooks/super/useGetAdminResetRequest';
import { useProcessAdminRequest } from '@/hooks/super/useProcessAdminRequest';
import { useState } from 'react';
import { ConfirmationModal } from '../ui/confirmationModal';
import { Toast } from '../ui/toast';
import { AdminCredentialDisplay } from './ResetCredentials';

type SelectedRequest = {
  accountId: string;
  username: string;
  type: 'password' | 'totp';
  action: 'approved' | 'rejected';
} | null;

export function AdminResetRequestTab({ t }: { t?: (key: string) => string }) {
  const { requests, isLoading: isFetching, errorKey: fetchError, refetch } = useAdminResetRequests();
  const { isProcessing, credentialData, processApproval, processRejection, clearCredentialData } = useProcessAdminRequest();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SelectedRequest>(null);
  
  // State quản lý Toast
  const [toastConfig, setToastConfig] = useState<{isOpen: boolean, type: 'success'|'error'|'warning', message?: string}>({
    isOpen: false,
    type: 'success'
  });

  const translate = (key: string) => (t ? t(key) : key);

  // Xử lý khi click vào nút Approve/Reject trên bảng
  const handleActionClick = async (accountId: string, username: string, type: 'password' | 'totp', action: 'approved' | 'rejected') => {
    if (action === 'rejected') {
      // Từ chối: Xử lý ngay, không gọi ConfirmationModal
      const result = await processRejection(accountId, type);
      if (result.success) {
        setToastConfig({ isOpen: true, type: 'success', message: 'requestRejectedSuccess' });
        refetch();
      } else {
        setToastConfig({ isOpen: true, type: 'error', message: result.errorKey });
      }
    } else {
      // Approve: Gọi ConfirmationModal
      setSelectedRequest({ accountId, username, type, action });
      setIsModalOpen(true);
    }
  };

  // Xử lý khi bấm Confirm trong Modal (Duyệt)
  const handleConfirmAction = async () => {
    if (!selectedRequest) return;
    
    const result = await processApproval(selectedRequest.accountId, selectedRequest.type);
    
    setIsModalOpen(false);
    setSelectedRequest(null);

    if (result.success) {
      refetch(); // Cập nhật lại danh sách ngay lập tức
      // Chỉ toast cho TOTP. Password sẽ được báo thông qua CredentialDisplay.
      if (selectedRequest.type === 'totp') {
        setToastConfig({ isOpen: true, type: 'success', message: 'requestApprovedSuccess' });
      }
    } else {
      setToastConfig({ isOpen: true, type: 'error', message: result.errorKey });
    }
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getModalTitle = () => {
    return translate('approveTitle') || 'Phê duyệt yêu cầu';
  };

  const getModalContent = () => {
    if (!selectedRequest) return null;
    const { username, type } = selectedRequest;
    const typeText = type === 'password' ? (translate('reqTypePassword') || 'cấp lại Mật khẩu') : (translate('reqTypeTotp') || 'cấp lại TOTP');
    
    return (
      <p>
        {translate('youAreAboutTo') || 'Bạn đang thao tác'} <strong>{translate('actionApproveText') || 'phê duyệt'}</strong> {translate('requestFor') || 'yêu cầu'} <strong>{typeText}</strong> {translate('ofAccount') || 'của tài khoản'} <strong>{username}</strong>.
      </p>
    );
  };

  return (
    <div className="animate-in fade-in relative">
      {/* ... Phần header của bạn giữ nguyên ... */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl text-[var(--ct-text)]">
            {translate('adminResetRequests') || 'Admin Reset Requests'}
          </h1>
        </div>
      </div>

      {fetchError && (
        <div className="mb-6 p-3.5 rounded-xl border flex items-start gap-2.5 text-sm animate-in shake duration-300" style={{ borderColor: '#ef4444', background: 'var(--ct-accent-red, rgba(239, 68, 68, 0.08))', color: '#ef4444' }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium text-balance">{translate(fetchError)}</span>
          <button onClick={refetch} className="ml-auto underline font-semibold hover:opacity-70">
            {translate('retry') || 'Retry'}
          </button>
        </div>
      )}

      {/* Bảng danh sách yêu cầu (Giữ nguyên cấu trúc) */}
      <div className="rounded-xl border overflow-hidden border-[var(--ct-border)]">
        <table className="w-full text-sm text-left">
          <thead style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
            {/* Headers ... */}
            <tr>
              <th className="px-4 py-3 font-semibold">{translate('adminId') || 'Admin Account'}</th>
              <th className="px-4 py-3 font-semibold">{translate('requestTime') || 'Time'}</th>
              <th className="px-4 py-3 font-semibold">{translate('requestType') || 'Request Type'}</th>
              <th className="px-4 py-3 font-semibold text-center">{translate('actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan={4} className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-[var(--ct-text)]/30 border-t-[var(--ct-text)] rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm opacity-50 text-[var(--ct-text)]">
                  {translate('noRequestsFound') || 'No pending requests.'}
                </td>
              </tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 border-[var(--ct-border)] text-[var(--ct-text)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{req.username}</p>
                    <p className="text-xs opacity-60 font-mono">ID: {req.accountId}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs opacity-70">
                    {new Date(req.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {req.type === 'password' 
                      ? (translate('reqTypePassword') || 'Password Reset')
                      : (translate('reqTypeTotp') || 'TOTP Reset')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleActionClick(req.accountId, req.username, req.type, 'approved')}
                        disabled={isProcessing}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50 transition-all"
                        title={translate('approve') || 'Approve'}
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => handleActionClick(req.accountId, req.username, req.type, 'rejected')}
                        disabled={isProcessing}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
                        title={translate('reject') || 'Reject'}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        title={getModalTitle()}
        content={getModalContent()}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        isLoading={isProcessing}
        confirmStyle="primary"
        t={translate}
      />

      {/* Hiển thị Popup Copy Password nếu duyệt Password Reset thành công */}
      {credentialData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <AdminCredentialDisplay 
            username={credentialData.username}
            newPassword={credentialData.temporary_password}
            onClose={clearCredentialData}
            t={translate}
          />
        </div>
      )}

      <Toast
        isOpen={toastConfig.isOpen}
        type={toastConfig.type}
        message={toastConfig.message}
        onClose={() => setToastConfig({ ...toastConfig, isOpen: false })}
        position="bottom-right"
        t={translate}
      />
    </div>
  );
}