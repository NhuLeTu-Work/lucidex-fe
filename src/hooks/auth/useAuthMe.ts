import { useState, useCallback } from 'react';
import { getAuthMeApi } from '@/api/endpoints/auth/authMeApi';
import type { UserProfile } from '@/api/types/auth.types';

export function useAuthMe(showToast: (type: 'success' | 'error' | 'warning', message: string) => void) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    // Nếu chưa có token thì không gọi API để tránh lỗi 401 không cần thiết
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsProfileLoading(true);
    try {
      const response = await getAuthMeApi();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401) {
        showToast('error', 'errorSessionExpired');
        // Xử lý logout tự động nếu cần (vd: clear localStorage)
      } else {
        showToast('error', 'errorFetchProfile');
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, [showToast]);

  return {
    userProfile,
    isProfileLoading,
    fetchProfile,
    setUserProfile, // Dùng để gán null khi User nhấn Logout
  };
}