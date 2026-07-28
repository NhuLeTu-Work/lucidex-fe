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

  const { activeTab, setActiveTab, confirmState, openConfirm, closeConfirm } = useSuperPortal();

  const {
    accounts,
    isCreating,
    newAdminCredentials,
    handleCreateAdmin,
    closeCreateModal,
    fetchAccounts,
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
            confirmState={confirmState}
            closeConfirm={closeConfirm}
            showToast={showToast}
            fetchAccounts={fetchAccounts}
          />
        )}
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
      
    </div>
  );
}