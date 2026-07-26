import { useState } from 'react';
import type { SuperAdminTab, ConfirmModalState } from '../../types/superAdmin';

// Hook thuần UI cho SuperAdminPortal: quản lý tab đang chọn + generic confirm modal.
// KHÔNG chứa state accounts/audit log giả lập — dữ liệu thật lấy từ useSuper.
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

  // TODO: `lock` và `delete` chưa có API thật.
  // Khi có API (lockAdminApi / deleteAdminApi), thay thân hàm này bằng gọi API thật
  // rồi refetch lại accounts từ useSuper — KHÔNG tự sửa state accounts ở đây để
  // tránh lệch dữ liệu giữa client và backend.
  const executeAction = async (
    onLock?: (id: string) => Promise<void>,
    onDelete?: (id: string) => Promise<void>
  ) => {
    const { actionType, targetId } = confirmState;
    if (!targetId || !actionType) return;

    if (actionType === 'lock' && onLock) {
      await onLock(targetId);
    } else if (actionType === 'delete' && onDelete) {
      await onDelete(targetId);
    }
    // actionType === 'resetTotp' | 'resetPassword' không còn xử lý ở đây nữa —
    // đã chuyển sang flow request-based trong useSuper (handleApproveRequest/handleRejectRequest).

    closeConfirm();
  };

  return {
    activeTab,
    setActiveTab,
    confirmState,
    openConfirm,
    closeConfirm,
    executeAction,
  };
}