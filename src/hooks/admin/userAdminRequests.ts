import { useState } from 'react';
import { toast } from 'sonner'; // Import Sonner thay cho Toast tự chế
import { mockAccounts } from '../../data/mockData';
import type { Account, RequestSubTab } from '../../types/admin';

export function useAdminRequests(t: (key: string) => string) {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts as Account[]);
  const [reqSubTab, setReqSubTab] = useState<RequestSubTab>('issuer');
  
  const [selectedReq, setSelectedReq] = useState<Account | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [docViewerOpen, setDocViewerOpen] = useState(false);

  // Lọc và sắp xếp requests (Oldest first)
  const pendingRequests = accounts.filter(a => a.status === 'pending' && a.registrationData);
  
  const pendingIssuers = pendingRequests
    .filter(a => a.type === 'issuer')
    .sort((a, b) => new Date(a.registrationData!.submittedAt).getTime() - new Date(b.registrationData!.submittedAt).getTime());
    
  const pendingOrgs = pendingRequests
    .filter(a => a.type === 'verifier')
    .sort((a, b) => new Date(a.registrationData!.submittedAt).getTime() - new Date(b.registrationData!.submittedAt).getTime());

  // Logic Duyệt (Sẽ gọi API PATCH ở đây sau này)
  const handleApprove = (req: Account) => {
    setAccounts(prev => prev.map(a => a.id === req.id ? { ...a, status: 'setup_required' } : a));
    setSelectedReq(null);
    toast.success(t('emailSent') || 'Email Sent', {
      description: `Dear ${req.registrationData?.regName}, your application for ${req.registrationData?.orgName} has been approved.`
    });
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
    
    const reqName = selectedReq.registrationData?.regName;
    const orgName = selectedReq.registrationData?.orgName;
    
    setRejectModalOpen(false);
    setSelectedReq(null);
    setRejectReason('');
    
    toast.error(t('emailSent') || 'Email Sent', {
      description: `Dear ${reqName}, your application for ${orgName} has been rejected. Reason: ${rejectReason}.`
    });
  };

  return {
    accounts,
    reqSubTab, setReqSubTab,
    selectedReq, setSelectedReq,
    rejectModalOpen, setRejectModalOpen,
    rejectReason, setRejectReason,
    docViewerOpen, setDocViewerOpen,
    pendingRequests, pendingIssuers, pendingOrgs,
    handleApprove, handleRejectSubmit
  };
}