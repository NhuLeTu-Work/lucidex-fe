import { useState } from 'react';
import { Key, RotateCcw, Lock, Unlock, Trash2, Plus, Loader2 } from 'lucide-react';
import type { UIAdminAccount } from '../../types/superAdmin';
import { ConfirmationModal } from '@/components/ui/confirmationModal'; // Chỉnh lại path nếu cần
import { AdminCredentialDisplay } from '@/components/super/ResetCredentials';
import { useProcessAdminRequest } from '@/hooks/super/useProcessAdminRequest';
import { useUpdateAdminStatus } from '@/hooks/super/useUpdateAdminStatus';
import { useDeleteAdmin } from '@/hooks/super/useDeleteAdmin';

interface Props {
  accounts: UIAdminAccount[]; 
  openConfirm: (title: string, msg: string, type: 'resetTotp' | 'resetPassword' | 'lock' | 'delete', id: string) => void;
  onOpenCreate: () => void;
  t: (key: string) => string;
  isCreating?: boolean; 
  confirmState: any;
  closeConfirm: () => void;
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void;
  fetchAccounts: () => void;
}
export function AdminAccountsTab({ accounts, openConfirm, onOpenCreate, t, isCreating, confirmState, closeConfirm, showToast, fetchAccounts }: Props) {
  const [lockReason, setLockReason] = useState('');
  const {
    isProcessing: isResetting,
    credentialData,
    processApproval,
    clearCredentialData,
  } = useProcessAdminRequest(showToast);

  const { updateStatus, isUpdating } = useUpdateAdminStatus(showToast, fetchAccounts);
  const { deleteAdmin, isDeleting } = useDeleteAdmin(showToast, fetchAccounts);
  // Đóng modal và clear state lý do
  const handleCloseModal = () => {
    setLockReason('');
    closeConfirm();
  };
  const handleConfirm = async () => {
    if (!confirmState.targetId) return;

    if (confirmState.actionType === 'resetPassword') {
      const res = await processApproval(confirmState.targetId, 'password');
      if (res.success) fetchAccounts(); 
      handleCloseModal();
    } else if (confirmState.actionType === 'resetTotp') {
      const res = await processApproval(confirmState.targetId, 'totp');
      if (res.success) fetchAccounts();
      handleCloseModal();
    } else if (confirmState.actionType === 'lock') {
      // Logic Khóa / Mở khóa
      const targetAcc = accounts.find(a => a.id === confirmState.targetId);
      const newStatus = targetAcc?.locked ? 'active' : 'locked';

      // Kiểm tra validate lý do nếu đang thao tác Khóa
      if (newStatus === 'locked' && !lockReason.trim()) {
        showToast('error', 'errorReasonRequired');
        return;
      }

      const res = await updateStatus(confirmState.targetId, newStatus, newStatus === 'locked' ? lockReason : null);
      if (res) handleCloseModal();
    } else if (confirmState.actionType === 'delete') {
      // Logic Xóa Admin
      const res = await deleteAdmin(confirmState.targetId);
      if (res) handleCloseModal();
    }
  };
  const renderModalContent = () => {
    if (confirmState.actionType === 'lock') {
      const targetAcc = accounts.find(a => a.id === confirmState.targetId);
      // Chỉ hiện ô nhập lý do khi tài khoản ĐANG ACTIVE (chuẩn bị bị khóa)
      if (targetAcc && !targetAcc.locked) {
        return (
          <div className="flex flex-col gap-2 mt-2 text-left">
            <p className="text-sm opacity-80 mb-2">{confirmState.message}</p>
            <label className="text-xs font-semibold opacity-70 tracking-wide uppercase">
              {t('lockReasonLabel') || 'Lý do khóa tài khoản *'}
            </label>
            <textarea
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              placeholder={t('lockReasonPlaceholder') || 'Vui lòng nhập lý do...'}
              className="w-full p-3 text-sm rounded-xl border outline-none transition-all focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/20"
              style={{ background: 'var(--ct-bg)', borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}
              rows={3}
            />
          </div>
        );
      }
    }
    if (confirmState.actionType === 'delete') {
      return (
        <div className="flex flex-col gap-2 mt-2 text-left">
          <p className="text-sm opacity-80 mb-2">{confirmState.message}</p>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">
              {t('deleteAdminWarning') || 'Cảnh báo: Hành động này không thể hoàn tác.'}
            </p>
          </div>
        </div>
      );
    }
    return <p>{confirmState.message}</p>;
  };
  return (
    <div className="animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[var(--ct-text)]">{t('adminAccountsTitle')}</h1>
        
        {/* Cập nhật nút bấm có loading */}
        <button 
          onClick={onOpenCreate} 
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
          {t('provisionNewAdmin')}
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--ct-border)' }}>
        <table className="w-full text-sm text-left">
          {/* ... (Phần thead và tbody giữ nguyên y hệt code cũ của bạn) ... */}
          <thead style={{ background: 'var(--ct-bg)', borderBottom: '1px solid var(--ct-border)', color: 'var(--ct-text)' }}>
            <tr>
              <th className="px-4 py-3 font-semibold">{t('username')}</th>
              <th className="px-4 py-3 font-semibold">{t('role')}</th>
              <th className="px-4 py-3 font-semibold">{t('totpStatus')}</th>
              <th className="px-4 py-3 font-semibold text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(acc => (
              <tr key={acc.id} className={`border-t transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${acc.locked ? 'opacity-50' : ''}`} style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)' }}>
                <td className="px-4 py-4 font-mono font-bold">{acc.username}</td>
                <td className="px-4 py-4">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${acc.role === 'Super Admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {acc.role}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold ${acc.totpEnabled ? 'text-green-600' : 'text-amber-600'}`}>
                    {acc.totpEnabled ? t('enabled') : t('setupRequired')}
                  </span>
                </td>
                <td className="px-4 py-4 flex items-center justify-end gap-2">
                  <button onClick={() => openConfirm(t('resetPassword'), `${t('resetPassword')} ${acc.username}?`, 'resetPassword', acc.id)} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--ct-text)]" title={t('resetPassword')}>
                    <Key size={16} />
                  </button>
                  <button onClick={() => openConfirm(t('resetTotpKey'), `${t('resetTotpKey')} ${acc.username}?`, 'resetTotp', acc.id)} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--ct-text)]" title={t('resetTotpKey')}>
                    <RotateCcw size={16} />
                  </button>
                  {acc.role !== 'Super Admin' && (
                    <>
                      <button onClick={() => openConfirm(acc.locked ? t('unlockAccount') : t('lockAccount'), `${acc.locked ? t('unlockAccount') : t('lockAccount')} ${acc.username}?`, 'lock', acc.id)} className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--ct-text)]" title={acc.locked ? t('unlockAccount') : t('lockAccount')}>
                        {acc.locked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button onClick={() => openConfirm(t('deleteAccount'), `${t('deleteAccount')} ${acc.username}?`, 'delete', acc.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500" title={t('deleteAccount')}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        content={renderModalContent()} // <-- Sử dụng hàm render Content động
        onConfirm={handleConfirm}
        onCancel={handleCloseModal}      // <-- Dùng hàm đóng có clear state
        isLoading={isResetting || isUpdating || isDeleting} // <-- Gộp trạng thái loading
        confirmStyle={confirmState.actionType === 'delete' || (confirmState.actionType === 'lock' && !accounts.find(a => a.id === confirmState.targetId)?.locked) ? 'danger' : 'primary'}
        t={t}
      />

      {credentialData && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <AdminCredentialDisplay 
            username={credentialData.username}
            newPassword={credentialData.temporary_password}
            onClose={clearCredentialData}
            t={t}
          />
        </div>
      )}
    </div>
  );
}