import { useState, useMemo } from 'react';
import { useApp } from '../app/AppContext';
import type { AdminTab } from '../types/admin';

// Hooks
import { useAdminRequests } from '../hooks/admin/userAdminRequests';
import { useAdminOrganizations } from '../hooks/admin/useGetOrganizations'; // <-- Import hook gọi API

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
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // ==========================================
  // 1. GỌI API LẤY DỮ LIỆU THẬT
  // ==========================================
  // API lấy danh sách đang chờ duyệt
  const { organizations, isLoading, fetchOrganizations } = useAdminOrganizations(undefined, 'pending_review');

  // TODO: Tạm thời để mảng rỗng. 
  // Sau này bạn gọi hook API lấy danh sách account thật (ví dụ: useAdminOrganizations(undefined, 'approved')) và gán vào đây
  const accounts: any[] = []; 

  // ==========================================
  // 2. PHÂN LOẠI DỮ LIỆU ĐỂ TRUYỀN XUỐNG CON
  // ==========================================
  const pendingIssuers = useMemo(() => organizations.filter(org => org.type === 'issuer'), [organizations]);
  const pendingOrgs = useMemo(() => organizations.filter(org => org.type === 'verifier'), [organizations]);
  const pendingCount = organizations.length;

  // ==========================================
  // 3. HOOK QUẢN LÝ TRẠNG THÁI UI VÀ ACTION
  // ==========================================
  const {
    reqSubTab, setReqSubTab, selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen,
    rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen, 
    handleApprove, handleRejectSubmit
  } = useAdminRequests(t);

  // Mock thông tin admin đăng nhập (Thay bằng dữ liệu thật từ Context/Redux nếu có)
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
      {/* --- MODALS RENDER (ĐÃ LOẠI BỎ CODE LẶP) --- */}
      {/* ========================================== */}
      {selectedReq && !rejectModalOpen && !docViewerOpen && (
        <RequestDetailModal
          selectedReq={selectedReq}
          onClose={() => setSelectedReq(null)}
          onApprove={async () => {
             // 1. Chờ duyệt API hoàn tất (nhận kết quả true/false)
             const isSuccess = await handleApprove(selectedReq);
             
             // 2. Nếu thành công thì mới reload data và đóng modal
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
          onSubmit={async () => {
             if (handleRejectSubmit) {
               // Chờ gọi API từ chối
               const isSuccess = await handleRejectSubmit(selectedReq!, rejectReason);
               
               if (isSuccess) {
                 await fetchOrganizations(); // Reload danh sách
                 setRejectReason(''); 
                 setRejectModalOpen(false); 
                 setSelectedReq(null); // Đóng hoàn toàn detail modal
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