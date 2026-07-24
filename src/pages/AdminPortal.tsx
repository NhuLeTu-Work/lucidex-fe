import { useState, useMemo } from 'react';
import { useApp } from '../app/AppContext';
import type { AdminTab } from '../types/admin';

// Hooks
import { useAdminRequests } from '../hooks/admin/userAdminRequests';
import { useAdminOrganizations } from '../hooks/admin/useGetOrganizations'; 

// Components
import { AdminSidebarDesktop, AdminSidebarMobile } from '../components/admin/AdminSidebar';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminRequests } from '../components/admin/AdminRequests';
import { AdminAccount } from '../components/admin/AdminAccout';

// Modals
import { RequestDetailModal } from '../components/admin/RequestDetailModal';
import { RejectReasonModal } from '../components/admin/RejectReasonModal';
import { DocViewerModal } from '../components/admin/DocReviewerModal';

export function AdminPortal() {
  const { t, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const { organizations, isLoading, fetchOrganizations } = useAdminOrganizations(undefined, 'pending_review');
  const accounts: any[] = []; 
  
  const pendingIssuers = useMemo(() => organizations.filter(org => org.type === 'issuer'), [organizations]);
  const pendingOrgs = useMemo(() => organizations.filter(org => org.type === 'verifier'), [organizations]);
  const pendingCount = organizations.length;
  
  // Gộp chung vào 1 lần gọi Hook duy nhất
  const {
    reqSubTab, setReqSubTab, selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen,
    rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen, 
    handleApprove,
    handleRejectSubmit // <-- Kéo handleRejectSubmit lên đây
  } = useAdminRequests(t, showToast);

  // Mock thông tin admin đăng nhập
  const currentAdmin = { name: 'Admin', email: 'admin@system.com', role: 'super' };

  return (
    <div className="flex min-h-[calc(100vh-64px)] relative">
      <AdminSidebarDesktop
        activeTab={activeTab} setActiveTab={setActiveTab}
        pendingCount={pendingCount} currentAdmin={currentAdmin} t={t}
      />

      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <AdminSidebarMobile activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

        {/* 4. TRUYỀN DỮ LIỆU XUỐNG DASHBOARD */}
        {activeTab === 'dashboard' && (
          <AdminDashboard 
            t={t} 
            pendingCount={pendingCount} 
            totalAccounts={accounts.length} 
            onTabChange={setActiveTab} 
            isLoading={isLoading} 
          />
        )}
        
        {/* 5. TRUYỀN DỮ LIỆU XUỐNG REQUESTS */}
        {activeTab === 'requests' && (
          <AdminRequests
            pendingIssuers={pendingIssuers} 
            pendingOrgs={pendingOrgs}       
            isLoading={isLoading}           
            reqSubTab={reqSubTab} 
            setReqSubTab={setReqSubTab}
            onSelectReq={setSelectedReq} 
            t={t}
          />
        )}
        
         {activeTab === 'settings' && <AdminAccount t={t}/>}
      </main>

      {/* ========================================== */}
      {/* --- MODALS RENDER --- */}
      {/* ========================================== */}
      {selectedReq && !rejectModalOpen && !docViewerOpen && (
        <RequestDetailModal
          selectedReq={selectedReq}
          onClose={() => setSelectedReq(null)}
          onApprove={async () => {
             const isSuccess = await handleApprove(selectedReq);
             
             if (isSuccess) {
               await fetchOrganizations(); 
               setSelectedReq(null); 
             }
          }}
          onRejectClick={() => setRejectModalOpen(true)}
          onViewDoc={() => setDocViewerOpen(true)}
          t={t}
        />
      )}

      {rejectModalOpen && (
        <RejectReasonModal
          reason={rejectReason} 
          setReason={setRejectReason}
          // Thêm event (e) vào đây
          onSubmit={async (e: React.FormEvent) => { 
             e?.preventDefault(); // <--- CHẶN RELOAD TRANG Ở ĐÂY

             if (handleRejectSubmit) {
               const isSuccess = await handleRejectSubmit(selectedReq!, rejectReason);
               
               if (isSuccess) {
                 await fetchOrganizations(); 
                 setRejectReason(''); 
                 setRejectModalOpen(false); 
                 setSelectedReq(null); 
               }
             }
          }} 
          onClose={() => setRejectModalOpen(false)}
          t={t}
        />
      )}

      {docViewerOpen && (
        <DocViewerModal onClose={() => setDocViewerOpen(false)} t={t} />
      )}
    </div>
  );
}