// hooks/useAccessTimer.ts
import { useEffect } from 'react';
import { refreshTokenApi } from '@/api/endpoints/authentication/refreshTokenApi';
import { saveTokens, isSessionExpired } from './useSessionTimer';

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // exp is in seconds → convert to ms
  } catch {
    return null;
  }
}

export function useAccessTokenTimer(logout: () => void) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return;

      if (isSessionExpired()) {
        logout();
        return;
      }

      let refreshAt: number;
      const expMs = decodeJwtExp(accessToken);

      if (expMs) {
        // Refresh 30 seconds before access token expires
        refreshAt = expMs - Date.now() - 30_000;
      } else {
        // Default 15 minutes access token duration -> refresh at 14 minutes (840,000 ms) after issue
        const issuedAt = Number(localStorage.getItem('access_token_issued_at')) || Date.now();
        const accessExpiresAt = issuedAt + 15 * 60 * 1000;
        refreshAt = accessExpiresAt - Date.now() - 30_000;
      }

      console.log('[accessTimer] ms until access token refresh:', refreshAt);

      if (refreshAt <= 0) {
        doRefresh();
        return;
      }
      timer = setTimeout(doRefresh, refreshAt);
    };

    const doRefresh = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return;

      if (isSessionExpired()) {
        logout();
        return;
      }

      try {
        const response = await refreshTokenApi({ refresh_token: refreshToken });
        const valid = saveTokens(
          response.data.access_token,
          response.data.refresh_token,
          response.data.refresh_token_expires_at
        );
        if (!valid) {
          logout();
          return;
        }
        scheduleRefresh(); // Schedule next cycle
      } catch (err: any) {
        const status = err.response?.status;
        const code = err.response?.data?.error_code;
        if (status === 401 || code === 'INVALID_REFRESH_TOKEN' || code === 'EXPIRED_REFRESH_TOKEN') {
          logout();
        }
      }
    };

    scheduleRefresh();

    // Đồng bộ khi access_token đổi ở tab khác hoặc do interceptor vừa refresh xong
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token') scheduleRefresh();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('storage', onStorage);
    };
  }, [logout]);
}