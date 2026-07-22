import { useState } from 'react';
import { toast } from 'sonner'; // Import Sonner thay cho Toast tự chế
import { mockAccounts } from '../../data/mockData';
import type { Account, RequestSubTab } from '../../types/admin';
import { approveOrganizationApi } from '@/api/endpoints/admin/approveOrgsApi';
import type { OrganizationRecord } from '@/api/types/admin.types';

export function useAdminRequests(t: (key: string) => string) {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts as Account[]);
  const [reqSubTab, setReqSubTab] = useState<RequestSubTab>('issuer');
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false); // <-- Thêm state loading
  const [selectedReq, setSelectedReq] = useState<OrganizationRecord | null>(null);
  const pendingRequests = accounts.filter(a => a.status === 'pending' && a.registrationData);
  
  const pendingIssuers = pendingRequests
    .filter(a => a.type === 'issuer')
    .sort((a, b) => new Date(a.registrationData!.submittedAt).getTime() - new Date(b.registrationData!.submittedAt).getTime());
    
  const pendingOrgs = pendingRequests
    .filter(a => a.type === 'verifier')
    .sort((a, b) => new Date(a.registrationData!.submittedAt).getTime() - new Date(b.registrationData!.submittedAt).getTime());

  // Logic Duyệt (Sẽ gọi API PATCH ở đây sau này)
  const handleApprove = async (reqToApprove: OrganizationRecord) => {
    if (!reqToApprove) return;
    
    setIsApproving(true);
    try {
      const response = await approveOrganizationApi(reqToApprove.id);
      
      if (response.success) {
        toast.success(t('approveSuccess') || 'Phê duyệt thành công và email mời đã được gửi!');
        setSelectedReq(null); // Đóng modal sau khi thành công
      }
    } catch (error: any) {
      const status = error.response?.status;
      
      // Xử lý các mã lỗi cụ thể theo đúng kịch bản
      if (status === 401) {
        toast.error('Phiên đăng nhập hết hạn hoặc chưa xác thực TOTP.');
        // window.location.href = '/login'; // Chuyển hướng về login nếu cần
      } else if (status === 404) {
        toast.error('Đơn đăng ký không tồn tại hoặc đã bị xóa.');
      } else if (status === 409) {
        toast.error('Yêu cầu này đã được xử lý hoặc đang cập nhật, vui lòng tải lại trang.');
      } else if (status === 502) {
        // Quan trọng: Tổ chức đã duyệt nhưng email gửi thất bại
        toast.warning('Duyệt thành công nhưng gửi email lỗi. Cần gửi lại invite thủ công.');
        setSelectedReq(null); // Vẫn đóng modal vì status tổ chức đã đổi thành approved
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt.');
      }
    } finally {
      setIsApproving(false);
    }
  };

  // Logic Từ chối (Sẽ gọi API PATCH ở đây sau này)
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim() || !selectedReq) return;

    setAccounts(prev => prev.map(a => a.id === selectedReq.id ? { 
      ...a, 
      status: 'rejected', 
      registrationData: { ...a.registrationData!, rejectedReason: rejectReason } 
    } : a));
    
    // const reqName = selectedReq.registrationData?.regName;
    // const orgName = selectedReq.registrationData?.orgName;
    
    setRejectModalOpen(false);
    setSelectedReq(null);
    setRejectReason('');
    
    // toast.error(t('emailSent') || 'Email Sent', {
    //   description: `Dear ${reqName}, your application for ${orgName} has been rejected. Reason: ${rejectReason}.`
    // });
  };

  return {
    accounts,
    reqSubTab, setReqSubTab,
    selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen,
    rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen,
    pendingRequests, pendingIssuers, pendingOrgs,
    handleApprove, handleRejectSubmit,
    isApproving
  };
}