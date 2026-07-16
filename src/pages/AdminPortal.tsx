import { useState } from 'react';
import { useApp } from '../app/AppContext';
import type { AdminTab } from '../types/admin';
import { currentAdmin } from '../data/mockData';

// Hooks
import { useAdminRequests } from '../hooks/admin/userAdminRequests';

// Components
import { AdminSidebarDesktop, AdminSidebarMobile } from '../components/admin/AdminSidebar';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminRequests } from '../components/admin/AdminRequests';
import { AdminAccounts } from '../components/admin/AdminAccounts';

// Modals
import { RequestDetailModal } from '../components/admin/RequestDetailModal';
import { RejectReasonModal } from '../components/admin/RejectReasonModal';
import { DocViewerModal } from '../components/admin/DocReviewerModal';

export function AdminPortal() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const {
    accounts, reqSubTab, setReqSubTab, selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen, rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen, pendingRequests, pendingIssuers, 
    pendingOrgs, handleApprove, handleRejectSubmit
  } = useAdminRequests(t);

  return (
    <div className="flex min-h-[calc(100vh-64px)] relative">
      <AdminSidebarDesktop
        activeTab={activeTab} setActiveTab={setActiveTab}
        pendingCount={pendingRequests.length} currentAdmin={currentAdmin} t={t}
      />

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <AdminSidebarMobile activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

        {activeTab === 'dashboard' && <AdminDashboard t={t} pendingCount={pendingRequests.length} totalAccounts={accounts.length} onTabChange={setActiveTab} />}
        
        {activeTab === 'requests' && (
          <AdminRequests
            pendingIssuers={pendingIssuers} pendingOrgs={pendingOrgs}
            reqSubTab={reqSubTab} setReqSubTab={setReqSubTab}
            onSelectReq={setSelectedReq} t={t}
          />
        )}
        
        {activeTab === 'accounts' && <AdminAccounts t={t} accounts={accounts} />}
      </main>

      {/* --- Modals Render --- */}
      {selectedReq && !rejectModalOpen && !docViewerOpen && (
        <RequestDetailModal
          selectedReq={selectedReq}
          onClose={() => setSelectedReq(null)}
          onApprove={() => handleApprove(selectedReq)}
          onRejectClick={() => setRejectModalOpen(true)}
          onViewDoc={() => setDocViewerOpen(true)}
          t={t}
        />
      )}

      {rejectModalOpen && (
        <RejectReasonModal
          reason={rejectReason} setReason={setRejectReason}
          onSubmit={handleRejectSubmit} onClose={() => setRejectModalOpen(false)}
          t={t}
        />
      )}

      {docViewerOpen && (
        <DocViewerModal onClose={() => setDocViewerOpen(false)} t={t} />
      )}
    </div>
  );
}