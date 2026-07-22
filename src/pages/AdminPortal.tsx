import { useState, useMemo } from 'react';
import { useApp } from '../app/AppContext';
import type { AdminTab } from '../types/admin';
import { currentAdmin } from '../data/mockData';

// Hooks
import { useAdminRequests } from '../hooks/admin/userAdminRequests';
import { useAdminOrganizations } from '../hooks/admin/useGetOrganizations'; // <-- Import hook gọi API

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

  // 1. GỌI API LẤY DỮ LIỆU Ở COMPONENT MẸ
  const { organizations, isLoading, fetchOrganizations } = useAdminOrganizations(null, 'pending_review');

  // 2. PHÂN LOẠI DỮ LIỆU ĐỂ TRUYỀN XUỐNG CON (Dùng useMemo để tối ưu)
  const pendingIssuers = useMemo(() => organizations.filter(org => org.type === 'issuer'), [organizations]);
  const pendingOrgs = useMemo(() => organizations.filter(org => org.type === 'verifier'), [organizations]);
  const pendingCount = organizations.length;

  // 3. HOOK QUẢN LÝ TRẠNG THÁI UI VÀ ACTION (Lưu ý: Bạn nên xóa logic mock data bên trong hook này)
  const {
    accounts, reqSubTab, setReqSubTab, selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen, rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen, handleApprove,
    // handleRejectSubmit
  } = useAdminRequests(t);

  return (
    <div className="flex min-h-[calc(100vh-64px)] relative">
      <AdminSidebarDesktop
        activeTab={activeTab} setActiveTab={setActiveTab}
        pendingCount={pendingCount} currentAdmin={currentAdmin} t={t} // <-- Dùng pendingCount từ API
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
            isLoading={isLoading} // <-- Có thể thêm prop này để hiển thị spinner trên Dashboard
          />
        )}
        
        {/* 5. TRUYỀN DỮ LIỆU XUỐNG REQUESTS */}
        {activeTab === 'requests' && (
          <AdminRequests
            pendingIssuers={pendingIssuers} // <-- Truyền danh sách thật
            pendingOrgs={pendingOrgs}       // <-- Truyền danh sách thật
            isLoading={isLoading}           // <-- Truyền trạng thái loading
            reqSubTab={reqSubTab} 
            setReqSubTab={setReqSubTab}
            onSelectReq={setSelectedReq} 
            t={t}
          />
        )}
        
        {activeTab === 'accounts' && <AdminAccounts t={t} accounts={accounts} />}
      </main>

      {/* --- Modals Render (Truyền thêm fetchOrganizations nếu action thay đổi dữ liệu) --- */}
      {selectedReq && !rejectModalOpen && !docViewerOpen && (
        <RequestDetailModal
          selectedReq={selectedReq}
          onClose={() => setSelectedReq(null)}
          onApprove={async () => {
             await handleApprove(selectedReq);
             fetchOrganizations(); // <-- Tự động làm mới danh sách sau khi Approve
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
             // === MOCK LOGIC: Dùng tạm khi chưa có API ===
             
             // 1. Hiển thị thông báo (Bạn có thể thay bằng toast.success nếu đang dùng Sonner/Toastify)
             alert(`Đã từ chối đơn đăng ký thành công!\nLý do: ${rejectReason}`);
             
             // 2. Reset state và đóng Modal
             setRejectReason(''); 
             setRejectModalOpen(false); 
             
             // 3. (Tùy chọn) Có thể gọi fetchOrganizations() ở đây nếu muốn test UI loading
             // fetchOrganizations(); 

             /* ===========================================
                TODO: KHI NÀO CÓ API THÌ BỎ COMMENT ĐOẠN NÀY VÀ XÓA MOCK LOGIC Ở TRÊN:
                
                await handleRejectSubmit();
                fetchOrganizations(); 
             =========================================== */
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