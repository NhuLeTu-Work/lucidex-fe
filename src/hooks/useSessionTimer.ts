// hooks/useSessionTimer.ts
import { useEffect } from 'react';

const SESSION_EXPIRES_KEY = 'session_expires_at';

export function markSessionStart(refreshTokenExpiresAt: string) {
  const expiresAtMs = new Date(refreshTokenExpiresAt).getTime();
  localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAtMs));
}

export function clearSessionTimer() {
  localStorage.removeItem(SESSION_EXPIRES_KEY);
}

/** Đặt trong AppProvider — tự logout đúng giờ dù user không thao tác gì */
export function useSessionTimer(logout: () => void) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY));
      if (!expiresAt) return;

      const ms = expiresAt - Date.now();
      if (ms <= 0) {
        logout();
        return;
      }
      timer = setTimeout(logout, ms);
    };

    schedule();

    // Đồng bộ đa tab: tab khác login/logout → tab này reschedule/tự logout theo
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_EXPIRES_KEY || e.key === 'refresh_token') {
        if (!localStorage.getItem('refresh_token')) {
          logout();
        } else {
          schedule();
        }
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('storage', onStorage);
    };
  }, [logout]);
}

// hooks/useSessionTimer.ts — thêm hàm này
export function saveTokens(accessToken: string, refreshToken?: string, refreshTokenExpiresAt?: string) {
  localStorage.setItem('access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
  if (refreshTokenExpiresAt) {
    markSessionStart(refreshTokenExpiresAt);
  }
}