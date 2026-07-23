import { useState } from 'react';
import { toast } from 'sonner';
import type { RequestSubTab } from '../../types/admin';
import { approveOrganizationApi } from '@/api/endpoints/admin/approveOrgsApi';
import type { OrganizationRecord } from '@/api/types/admin.types';

export function useAdminRequests(t: (key: string) => string) {
  // Đã xóa mockAccounts và các biến pendingRequests, pendingIssuers... 
  // vì Component cha (AdminPortal) đã đảm nhận việc lấy data từ API thật.
  
  const [reqSubTab, setReqSubTab] = useState<RequestSubTab>('issuer');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedReq, setSelectedReq] = useState<OrganizationRecord | null>(null);

  // Trả về boolean (true/false) để báo cho Component cha biết kết quả
  const handleApprove = async (reqToApprove: OrganizationRecord): Promise<boolean> => {
    if (!reqToApprove) return false;
    
    setIsApproving(true);
    try {
      const response = await approveOrganizationApi(reqToApprove.id);
      
      if (response.success) {
        toast.success(t('approveSuccess') || 'Phê duyệt thành công và email mời đã được gửi!');
        return true; // Trả về true để Component cha tiến hành reload data
      }
      return false;
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 401) {
        toast.error('Phiên đăng nhập hết hạn hoặc chưa xác thực TOTP.');
      } else if (status === 404) {
        toast.error('Đơn đăng ký không tồn tại hoặc đã bị xóa.');
      } else if (status === 409) {
        toast.error('Yêu cầu này đã được xử lý hoặc đang cập nhật, vui lòng tải lại trang.');
      } else if (status === 502) {
        toast.warning('Duyệt thành công nhưng gửi email lỗi. Cần gửi lại invite thủ công.');
        return true; // Vẫn tính là duyệt thành công trên DB, cho phép reload data
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt.');
      }
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  // Khung chuẩn bị cho API Từ chối (Reject)
  const handleRejectSubmit = async (reqToReject: OrganizationRecord, reason: string): Promise<boolean> => {
    if (!reqToReject || !reason.trim()) return false;

    // TODO: Gắn API từ chối thật vào đây
    // try {
    //   const response = await rejectOrganizationApi(reqToReject.id, reason);
    //   if (response.success) return true;
    //   return false;
    // } catch(e) { ... }

    toast.success(`Đã từ chối đơn đăng ký. Lý do: ${reason}`);
    return true; // Giả lập thành công
  };

  return {
    reqSubTab, setReqSubTab,
    selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen,
    rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen,
    handleApprove, handleRejectSubmit,
    isApproving
  };
}