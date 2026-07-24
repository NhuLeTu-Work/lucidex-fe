import { useState } from 'react';
import type { RequestSubTab } from '../../types/admin';
import { approveOrganizationApi } from '@/api/endpoints/admin/approveOrgsApi';
import type { OrganizationRecord } from '@/api/types/admin.types';
import { rejectOrganizationApi } from '@/api/endpoints/admin/rejectOrganizationApi';

export function useAdminRequests(
  _t: (key: string) => string, 
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void
) {
  
  const [reqSubTab, setReqSubTab] = useState<RequestSubTab>('issuer');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedReq, setSelectedReq] = useState<OrganizationRecord | null>(null);

  const handleApprove = async (reqToApprove: OrganizationRecord): Promise<boolean> => {
    if (!reqToApprove) return false;
    
    setIsApproving(true);
    try {
      const response = await approveOrganizationApi(reqToApprove.id);
      
      if (response.success) {
        showToast('success', 'requestApprovedSuccess'); // Đã map key từ dict
        return true; 
      }
      return false;
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 401) {
        showToast('error', 'errorAdminSession'); // Đã map key
      } else if (status === 404) {
        showToast('error', 'errorOrgNotFound'); // Đã map key
      } else if (status === 409) {
        showToast('error', 'errorOrgAlreadyProcessed'); // Đã map key
      } else if (status === 502) {
        showToast('warning', 'errorEmailDeliveryFailed'); // Đã map key
        return true; 
      } else {
        showToast('error', 'toastDefaultError'); // Fallback mặc định từ dict
      }
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectSubmit = async (reqToReject: OrganizationRecord, reason: string): Promise<boolean> => {
    if (!reqToReject) return false;
    
    if (!reason.trim()) {
      showToast('error', 'errorEmptyRejectReason'); // Đã map key
      return false;
    }

    setIsRejecting(true);
    try {
      const response = await rejectOrganizationApi(reqToReject.id, { reason: reason.trim() });
      
      if (response.success) {
        showToast('success', 'rejectSuccess'); // Đã map key
        return true;
      }
      return false;
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 401) {
        showToast('error', 'errorAdminSession'); // Đã map key
      } else if (status === 404) {
        showToast('error', 'errorOrgNotFound'); // Đã map key
      } else if (status === 409) {
        showToast('error', 'errorOrgAlreadyProcessed'); // Đã map key
      } else if (status === 422) {
        showToast('error', 'errorEmptyRejectReason'); // Đã map key
      } else if (status === 500) {
        showToast('error', 'errorServerNotification'); // Đã map key
      } else if (status === 502) {
        showToast('warning', 'errorEmailDeliveryFailed'); // Đã map key
        return true; 
      } else {
        showToast('error', 'errorRejectFailed'); // Đã map key
      }
      return false;
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    reqSubTab, setReqSubTab,
    selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen,
    rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen,
    handleApprove, handleRejectSubmit,
    isApproving,
    isRejecting
  };
}