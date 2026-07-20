import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';

export type UserRole = 'guest' | 'owner' | 'issuer' | 'verifier' | 'admin' | 'super';

interface AppContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  t: (key: string) => string;
  lang: 'vi' | 'en';
  setLang: (l: 'vi' | 'en') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [role, setRole] = useState<UserRole>('guest');

  const switchLang = useCallback(() => setLang(lang === 'vi' ? 'en' : 'vi'), [lang, setLang]);

  return (
    <AppContext.Provider value={{ role, setRole, t, lang, setLang: switchLang as any, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}