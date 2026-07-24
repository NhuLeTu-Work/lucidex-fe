import { Check, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/app/AppContext';
import { ConfirmationModal } from '../ui/confirmationModal';
import { AdminCredentialDisplay } from './ResetCredentials';

// Đổi tên khi import để không bị trùng lặp chức năng
import { useAdminResetRequests as useGetAdminResetRequests } from '@/hooks/super/useGetAdminResetRequest';
import { useProcessAdminRequest } from '@/hooks/super/useProcessAdminRequest';

type SelectedRequest = {
  accountId: string;
  username: string;
  type: 'password' | 'totp';
  action: 'approved' | 'rejected';
} | null;

export function AdminResetRequestTab({ t: externalT }: { t?: any }) {
  // Lấy hàm showToast global từ AppContext
  const { t: contextT, showToast } = useApp();
  const t = externalT || contextT;
  const translate = (key: string) => (t ? t(key) : key);

  // Hook 1: Fetch danh sách yêu cầu
  const { requests, isLoading: isFetching, errorKey: fetchError, refetch } = useGetAdminResetRequests();
  
  const { 
    isProcessing, 
    credentialData, 
    processApproval, 
    clearCredentialData,
    handleRejectTotp, 
    handleRejectPassword, 
    isRejectingId, 
    isRequestValid 
  } = useProcessAdminRequest(showToast);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SelectedRequest>(null);

  // Xử lý khi click vào nút Approve/Reject trên bảng
  const handleActionClick = async (accountId: string, username: string, type: 'password' | 'totp', action: 'approved' | 'rejected') => {
    if (action === 'rejected') {
      // Từ chối: Xử lý ngay, Hook Reject đã tự gọi showToast thông báo
      const success = type === 'totp' 
        ? await handleRejectTotp(accountId) 
        : await handleRejectPassword(accountId);
        
      if (success) {
        refetch(); // Cập nhật lại danh sách ngay lập tức
      }
    } else {
      // Approve: Bật Modal Confirm
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
      refetch(); 
      if (selectedRequest.type === 'totp') {
        showToast('success', 'requestApprovedSuccess');
      }
    } else {
      showToast('error', result.errorKey);
    }
  };

  const handleCancelAction = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const getModalTitle = () => translate('approveTitle') || 'Phê duyệt yêu cầu';

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

      {/* Bảng danh sách yêu cầu */}
      <div className="rounded-xl border overflow-hidden border-[var(--ct-border)]">
        <table className="w-full text-sm text-left">
          <thead style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
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
              requests.map(req => {
                // Xác định trạng thái của từng row
                const isValid = isRequestValid(req.timestamp);
                const isRejecting = isRejectingId === `totp-${req.accountId}` || isRejectingId === `pwd-${req.accountId}`;
                const isDisabled = isProcessing || isRejecting;

                return (
                  <tr key={`${req.accountId}-${req.type}`} className="border-t hover:bg-black/5 dark:hover:bg-white/5 border-[var(--ct-border)] text-[var(--ct-text)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{req.username}</p>
                      <p className="text-xs opacity-60 font-mono">ID: {req.accountId}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs opacity-70">
                      {new Date(req.timestamp).toLocaleString()}
                      {/* Cảnh báo hết hạn */}
                      {!isValid && (
                        <span className="block text-red-500 text-[10px] mt-1 font-sans font-semibold">
                          {translate('requestExpired24h') || 'Expired (>24h)'}
                        </span>
                      )}
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
                          disabled={isDisabled || !isValid} // Chặn Approve nếu quá 24h
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-30 transition-all"
                          title={translate('approve') || 'Approve'}
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleActionClick(req.accountId, req.username, req.type, 'rejected')}
                          disabled={isDisabled} // Vẫn cho phép Reject để xóa yêu cầu
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30 transition-all"
                          title={translate('reject') || 'Reject'}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
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
    </div>
  );
}