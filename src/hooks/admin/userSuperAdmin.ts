import { useState } from 'react';
import { toast } from 'sonner';
import { generateAdminUsername, generateTempPassword } from '../../utils/credentialUtils';
import type { SuperAdminTab, AdminAccount, SystemAuditLog, ConfirmModalState } from '../../types/superAdmin';

export function useSuperAdmin() {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('accounts');
  const [accounts, setAccounts] = useState<AdminAccount[]>([
    { id: 'sa_1', username: 'admin-MASTER', role: 'Super Admin', totpEnabled: true, locked: false, createdAt: new Date().toISOString() },
    { id: 'oa_1', username: 'admin-X7K9P2', role: 'Operations Admin', totpEnabled: true, locked: false, createdAt: new Date().toISOString() }
  ]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{username: string, password: string} | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmModalState>({ isOpen: false, title: '', message: '', actionType: null, targetId: null });

  // Rate Limiting Mock
  const [resetAttempts, setResetAttempts] = useState<Record<string, number>>({});

  const logAudit = (action: string, target: string) => {
    const log: SystemAuditLog = { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), actor: 'admin-MASTER', action, target };
    setAuditLogs(prev => [log, ...prev]);
  };

  const openConfirm = (title: string, message: string, actionType: ConfirmModalState['actionType'], targetId: string) => {
    setConfirmState({ isOpen: true, title, message, actionType, targetId });
  };

  const executeAction = () => {
    const { actionType, targetId } = confirmState;
    if (!targetId || !actionType) return;

    if (actionType === 'resetTotp') {
      setAccounts(prev => prev.map(a => a.id === targetId ? { ...a, totpEnabled: false } : a));
      logAudit('Reset TOTP Key', targetId);
      toast.success('TOTP has been reset for this account.');
    } 
    else if (actionType === 'resetPassword') {
      const attempts = resetAttempts[targetId] || 0;
      if (attempts >= 5) {
        toast.error('Too many reset attempts for this account. Please try again later.');
        setConfirmState({ ...confirmState, isOpen: false });
        return;
      }
      setResetAttempts(prev => ({ ...prev, [targetId]: attempts + 1 }));
      const tempPwd = generateTempPassword();
      logAudit('Reset Password', targetId);
      toast.success(`New temporary password generated: ${tempPwd}`, { duration: 10000 });
    }
    else if (actionType === 'lock') {
      setAccounts(prev => prev.map(a => a.id === targetId ? { ...a, locked: !a.locked } : a));
      logAudit('Toggled Lock Status', targetId);
      toast.success('Account lock status updated.');
    }
    else if (actionType === 'delete') {
      setAccounts(prev => prev.filter(a => a.id !== targetId));
      logAudit('Deleted Account', targetId);
      toast.success('Account deleted successfully.');
    }
    setConfirmState({ ...confirmState, isOpen: false });
  };

  const handleCreateAdmin = () => {
    // Trực tiếp tạo ngay khi được gọi
    const username = generateAdminUsername();
    const password = generateTempPassword();
    setNewCredentials({ username, password });
    
    const newAcc: AdminAccount = {
      id: `oa_${Date.now()}`, username, role: 'Operations Admin', 
      totpEnabled: false, locked: false, createdAt: new Date().toISOString()
    };
    
    setAccounts(prev => [...prev, newAcc]);
    logAudit('Created Operations Admin', username);
    setIsCreateModalOpen(true); // Mở thẳng modal chứa kết quả
  };

  return {
    activeTab, setActiveTab, accounts, auditLogs,
    isCreateModalOpen, setIsCreateModalOpen, newCredentials, handleCreateAdmin,
    confirmState, setConfirmState, openConfirm, executeAction
  };
}