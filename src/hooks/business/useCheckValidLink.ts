import { useState, useEffect } from 'react';
import { validateInviteTokenApi } from '@/api/endpoints/business/validateInviteApi';

export function useCheckValidLink(token: string | null) {
  const [isValidating, setIsValidating] = useState(false);
  const [isInitialLinkInvalid, setIsInitialLinkInvalid] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);

  useEffect(() => {
    // Nếu không có token thì không cần gọi API (đây không phải luồng invite)
    if (!token) return;

    const checkToken = async () => {
      setIsValidating(true);
      try {
        const response = await validateInviteTokenApi(token);
        if (response.success) {
          setInviteData(response.data);
          setIsInitialLinkInvalid(false);
        }
      } catch (error: any) {
        const status = error.response?.status;
        const errorCode = error.response?.data?.error_code || error.response?.error_code;
        
        // Bắt chính xác lỗi 400 INVALID_INVITE theo doc
        if (status === 400 && errorCode === 'INVALID_INVITE') {
          setIsInitialLinkInvalid(true);
        } else {
          // Các lỗi khác (422 thiếu token, 500 server) cũng nên chặn lại cho an toàn
          setIsInitialLinkInvalid(true);
        }
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token]);

  return { isValidating, isInitialLinkInvalid, inviteData };
}