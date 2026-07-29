import { useState } from 'react';
import type { SuperAdminTab, ConfirmModalState } from '../../types/superAdmin';

export function useSuperPortal() {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('accounts');

  const [confirmState, setConfirmState] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    actionType: null,
    targetId: null,
  });

  const openConfirm = (
    title: string,
    message: string,
    actionType: ConfirmModalState['actionType'],
    targetId: string
  ) => {
    setConfirmState({ isOpen: true, title, message, actionType, targetId });
  };

  const closeConfirm = () => setConfirmState((prev) => ({ ...prev, isOpen: false }));

  return {
    activeTab,
    setActiveTab,
    confirmState,
    openConfirm,
    closeConfirm,
  };
}