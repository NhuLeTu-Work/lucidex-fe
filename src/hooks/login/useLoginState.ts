import { useState, useEffect } from 'react';
import type { Account, LoginView, OtpMethod } from './types';

const STORAGE_KEY = 'login_flow_state';
const TOKEN_TTL_MS = 1 * 60 * 1000; 

type PersistedState = {
  view: LoginView;
  currentAcc: Account | null;
  tempOtpToken: string | null;
  setupToken: string | null;
  challengeToken: string | null;
  qrCode: string | null;
  manualEntryKey: string | null;
  otpMethod: OtpMethod;
  savedAt: number; // timestamp lúc lưu
};

const VIEWS_TO_PERSIST: LoginView[] = ['login_2fa', 'setup_2fa'];

function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedState;

    if (!VIEWS_TO_PERSIST.includes(parsed.view)) return {};

    // Check hết hạn dựa trên thời điểm lưu + TTL
    const isExpired = !parsed.savedAt || (Date.now() - parsed.savedAt) > TOKEN_TTL_MS;
    if (isExpired) {
      sessionStorage.removeItem(STORAGE_KEY);
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

export function useLoginState() {
  const persisted = loadPersistedState();

  const [view, setView] = useState<LoginView>(persisted.view || 'login');
  const [currentAcc, setCurrentAcc] = useState<Account | null>(persisted.currentAcc || null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSetupPwd, setShowSetupPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSetupSuccess, setIsSetupSuccess] = useState(false);

  const [otpMethod, setOtpMethod] = useState<OtpMethod>(persisted.otpMethod || 'email');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [tempOtpToken, setTempOtpToken] = useState<string | null>(persisted.tempOtpToken || null);
  const [setupToken, setSetupToken] = useState<string | null>(persisted.setupToken || null);
  const [challengeToken, setChallengeToken] = useState<string | null>(persisted.challengeToken || null);
  const [qrCode, setQrCode] = useState<string | null>(persisted.qrCode || null);
  const [manualEntryKey, setManualEntryKey] = useState<string | null>(persisted.manualEntryKey || null);

  // savedAt giữ nguyên từ lần lưu gốc, chỉ set 1 lần khi bắt đầu vào view cần persist
  const [savedAt, setSavedAt] = useState<number | null>(persisted.savedAt || null);

  useEffect(() => {
    if (VIEWS_TO_PERSIST.includes(view)) {
      // Nếu chưa có savedAt (mới vào view này) -> set thời điểm bắt đầu đếm TTL
      const timestamp = savedAt ?? Date.now();
      if (!savedAt) setSavedAt(timestamp);

      const toSave: PersistedState = {
        view, currentAcc, tempOtpToken, setupToken,
        challengeToken, qrCode, manualEntryKey, otpMethod,
        savedAt: timestamp
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      if (savedAt !== null) setSavedAt(null);
    }
  }, [view, currentAcc, tempOtpToken, setupToken, challengeToken, qrCode, manualEntryKey, otpMethod]);

  // Tự động đưa về login nếu token hết hạn trong lúc đang mở form OTP (không chỉ check lúc F5)
  useEffect(() => {
    if (!VIEWS_TO_PERSIST.includes(view) || !savedAt) return;
    const remaining = TOKEN_TTL_MS - (Date.now() - savedAt);
    if (remaining <= 0) {
      setView('login');
      setOtpError('errorSessionExpired');
      return;
    }
    const timer = setTimeout(() => {
      setView('login');
      setOtpError('errorSessionExpired');
    }, remaining);
    return () => clearTimeout(timer);
  }, [view, savedAt]);

  return {
    view, setView,
    currentAcc, setCurrentAcc,
    email, setEmail,
    password, setPassword,
    setupPassword, setSetupPassword,
    setupConfirm, setSetupConfirm,
    showPassword, setShowPassword,
    showSetupPwd, setShowSetupPwd,
    showConfirmPwd, setShowConfirmPwd,
    isSetupSuccess, setIsSetupSuccess,
    otpMethod, setOtpMethod,
    otpValue, setOtpValue,
    otpError, setOtpError,
    isOtpLoading, setIsOtpLoading,
    error, setError,
    isLoading, setIsLoading,
    tempOtpToken, setTempOtpToken,
    setupToken, setSetupToken,
    challengeToken, setChallengeToken,
    qrCode, setQrCode,
    manualEntryKey, setManualEntryKey
  };
}