import { useState, useCallback } from 'react';
import { useApp } from '@/app/AppContext';
import { createVerifiedLinkApi } from '@/api/endpoints/owner/createVerifiedLinkApi';
import type {
  CreateVerifiedLinkPayload,
  VerifiedLinkData,
} from '@/api/types/owner.types';

export function useCreateVerifiedLink() {
  const { showToast } = useApp();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdData, setCreatedData] = useState<VerifiedLinkData | null>(null);

  const generateLinkCode = useCallback(
    async (payload: CreateVerifiedLinkPayload): Promise<VerifiedLinkData | null> => {
      setIsSubmitting(true);
      try {
        const res = await createVerifiedLinkApi(payload);
        if (res.success && res.data) {
          setCreatedData(res.data);
          return res.data;
        }
        showToast('error', res.message || 'Không thể tạo mã chia sẻ văn bằng');
        return null;
      } catch (err: any) {
        const errorCode = err?.response?.data?.error_code;
        const backendMessage = err?.response?.data?.message;

        let msg = 'Không thể tạo mã chia sẻ văn bằng';
        if (errorCode === 'CREDENTIAL_NOT_FOUND') {
          msg = 'Văn bằng không tồn tại hoặc bạn không có quyền sở hữu';
        } else if (errorCode === 'CREDENTIAL_NOT_CLAIMED') {
          msg = 'Văn bằng chưa ở trạng thái đã nhận (claimed)';
        } else if (errorCode === 'INVALID_EXPIRATION') {
          msg = 'Thời gian hết hạn phải ở trong tương lai';
        } else if (errorCode === 'INVALID_ACCESS_COUNT') {
          msg = 'Số lần truy cập tối đa phải lớn hơn hoặc bằng 1';
        } else if (errorCode === 'INVALID_ORG_ID') {
          msg = 'ID tổ chức xác thực không hợp lệ';
        } else if (backendMessage) {
          msg = backendMessage;
        }

        showToast('error', msg);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [showToast]
  );

  return {
    generateLinkCode,
    isSubmitting,
    createdData,
    setCreatedData,
  };
}
