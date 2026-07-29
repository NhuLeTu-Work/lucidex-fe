import { useState, useCallback } from 'react';
import { getAuthMeApi } from '@/api/endpoints/authentication/authMeApi';
import type { UserProfile } from '@/api/types/auth.types';
import { isCancelledError } from '@/app/authFlag';
export function useAuthMe(
  showToast: (type: 'success' | 'error' | 'warning', message: string) => void,
  logout: () => void,
) {
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
      if (isCancelledError(error)) return;
      const status = error.response?.status;
      if (status === 401 && (error.response?.data.error_code === 'INVALID_REFRESH_TOKEN' || error.response?.data.error_code === 'UNAUTHORIZED')) {
        showToast('error', 'errorSessionExpired');
        logout();
        return;
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