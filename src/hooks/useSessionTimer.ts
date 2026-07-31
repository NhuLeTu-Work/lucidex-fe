// hooks/useSessionTimer.ts
import { useEffect } from 'react';

const SESSION_EXPIRES_KEY = 'session_expires_at';

export function isSessionExpired(): boolean {
  const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY));
  if (!expiresAt) return false;
  return Date.now() >= expiresAt;
}

export function markSessionStart(refreshTokenExpiresAt: string): boolean {
  if (!refreshTokenExpiresAt) return true;
  const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(refreshTokenExpiresAt);
  const normalized = hasTimezone ? refreshTokenExpiresAt : refreshTokenExpiresAt + 'Z';
  const expiresAtMs = new Date(normalized).getTime();
  if (isNaN(expiresAtMs)) return true;

  localStorage.setItem(SESSION_EXPIRES_KEY, String(expiresAtMs));

  console.log(
    'session_expires_at (VN time):',
    new Date(expiresAtMs).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
  );

  if (expiresAtMs <= Date.now()) {
    return false;
  }
  return true;
}

export function clearSessionTimer() {
  localStorage.removeItem(SESSION_EXPIRES_KEY);
  localStorage.removeItem('access_token_issued_at');
}

/** Đặt trong AppProvider — tự logout đúng giờ dù user không thao tác gì */
let scheduleFn: (() => void) | null = null;

export function useSessionTimer(logout: () => void) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      const expiresAt = Number(localStorage.getItem(SESSION_EXPIRES_KEY));
      console.log('[sessionTimer] expiresAt:', expiresAt, 'ms left:', expiresAt ? expiresAt - Date.now() : null);
      if (!expiresAt) return;
      const ms = expiresAt - Date.now();
      if (ms <= 0) {
        logout();
        return;
      }
      timer = setTimeout(logout, ms);
    };

    scheduleFn = schedule;
    schedule();

    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_EXPIRES_KEY || e.key === 'refresh_token') {
        if (!localStorage.getItem('refresh_token') || isSessionExpired()) {
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
      scheduleFn = null;
    };
  }, [logout]);
}

export function triggerReschedule() {
  scheduleFn?.();
}

export function saveTokens(accessToken: string, refreshToken?: string, refreshTokenExpiresAt?: string): boolean {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('access_token_issued_at', String(Date.now()));
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
  if (refreshTokenExpiresAt) {
    const isValid = markSessionStart(refreshTokenExpiresAt);
    triggerReschedule();
    return isValid;
  }
  return true;
}


