import { useApp } from '@/app/AppContext';
import { useSuper } from '@/hooks/super/useSuper';
import { useSuperPortal } from '@/hooks/super/useSuperPortal';
import { SuperAdminSidebar } from '../components/super/SuperAdminSidebar';
import { AdminAccountsTab } from '../components/super/AdminAccountsTab';
import { AuditLogTab } from '../components/super/AuditLogTab';
import { CreateAdminModal } from '../components/super/CreateAdminModal';
import { AdminResetRequestTab } from '@/components/super/AdminResetRequests';

export function SuperAdminPortal() {
  const { t, showToast } = useApp();

  const { activeTab, setActiveTab, confirmState, openConfirm, closeConfirm, executeAction } = useSuperPortal();

  const {
    accounts,
    isCreating,
    newAdminCredentials,
    handleCreateAdmin,
    closeCreateModal,
  } = useSuper(showToast);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

      <main className="flex-1 p-6 lg:p-10 overflow-auto bg-[var(--ct-bg)]">
        {activeTab === 'accounts' && (
          <AdminAccountsTab
            t={t}
            accounts={accounts}
            isCreating={isCreating}
            openConfirm={openConfirm}
            onOpenCreate={handleCreateAdmin}
          />
        )}

        {/* TODO: AuditLogTab hiện chưa có nguồn dữ liệu thật (chưa có API audit logs).
            Cần bổ sung useAuditLogs (gọi API) trước khi tab này hiển thị đúng. */}
        {activeTab === 'audit' && <AuditLogTab t={t} logs={[]} />}

        {activeTab === 'admin_requests' && <AdminResetRequestTab t={t} />}
      </main>

      {newAdminCredentials && (
        <CreateAdminModal
          t={t}
          credentials={newAdminCredentials}
          onClose={closeCreateModal}
          showToast={showToast}
        />
      )}

      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl p-6 bg-[var(--ct-surface)] border border-[var(--ct-border)] shadow-xl animate-in zoom-in-95">
            <h3 className="font-display text-xl font-semibold mb-2 text-[var(--ct-text)]">{confirmState.title}</h3>
            <p className="text-sm opacity-70 mb-6 text-[var(--ct-text)]">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 text-sm rounded-xl border border-[var(--ct-border)] text-[var(--ct-text)] hover:bg-black/5"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => executeAction(/* onLock */ undefined, /* onDelete */ undefined)}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl ${
                  confirmState.actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:opacity-80'
                }`}
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