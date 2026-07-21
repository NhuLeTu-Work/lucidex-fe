import { useApp } from '@/app/AppContext';
import { useSuperAdmin } from '../hooks/admin/userSuperAdmin';
import { useAdminAccounts } from '@/hooks/super/useAdminAccount';
import { SuperAdminSidebar } from '../components/super/SuperAdminSidebar';
import { AdminAccountsTab } from '../components/super/AdminAccountsTab';
import { AuditLogTab } from '../components/super/AuditLogTab';
import { CreateAdminModal } from '../components/super/CreateAdminModal';

export function SuperAdminPortal() {
  const { t } = useApp();

  // 1. Hook cũ: Chỉ còn quản lý Tab, hiển thị danh sách và Confirm Modal
  const {
    activeTab, setActiveTab, accounts, auditLogs,
    confirmState, setConfirmState, openConfirm, executeAction
  } = useSuperAdmin();

  // 2. Hook mới: Chuyên phụ trách việc gọi API Create Admin và quản lý state của Credentials Modal
  const {
    // isCreating,
    newAdminCredentials,
    handleCreateAdmin,
    closeCreateModal
  } = useAdminAccounts(t);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

      <main className="flex-1 p-6 lg:p-10 overflow-auto bg-[var(--ct-bg)]">
        {activeTab === 'accounts' && (
          <AdminAccountsTab 
            t={t}
            accounts={accounts} 
            openConfirm={openConfirm} 
            // Gắn hàm tạo API vào nút bấm (bạn có thể truyền thêm isCreating vào Tab này để làm hiệu ứng xoay xoay loading nếu muốn)
            onOpenCreate={handleCreateAdmin} 
          />
        )}
        {activeTab === 'audit' && <AuditLogTab t={t} logs={auditLogs} />}
      </main>

      {/* 3. Modal Tạo Admin: Bật lên khi có kết quả credentials trả về từ API */}
      {newAdminCredentials && (
        <CreateAdminModal 
          t={t}
          credentials={newAdminCredentials} 
          onClose={closeCreateModal}
        />
      )}

      {/* Generic Confirm Modal (Giữ nguyên) */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-[var(--ct-surface)] border border-[var(--ct-border)] shadow-xl animate-in zoom-in-95">
            <h3 className="font-display text-xl font-semibold mb-2 text-[var(--ct-text)]">{confirmState.title}</h3>
            <p className="text-sm opacity-70 mb-6 text-[var(--ct-text)]">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmState({ ...confirmState, isOpen: false })} 
                className="px-4 py-2 text-sm rounded-xl border border-[var(--ct-border)] text-[var(--ct-text)] hover:bg-black/5"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button 
                onClick={executeAction} 
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl ${confirmState.actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:opacity-80'}`}
              >
                {t('confirm') || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}