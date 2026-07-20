export type SuperAdminTab = 'accounts' | 'audit';

export interface AdminAccount {
  id: string;
  username: string;
  role: 'Super Admin' | 'Operations Admin';
  totpEnabled: boolean;
  locked: boolean;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: 'resetTotp' | 'resetPassword' | 'lock' | 'delete' | null;
  targetId: string | null;
}