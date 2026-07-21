import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';

export type UserRole = 'guest' | 'owner' | 'issuer' | 'verifier' | 'admin' | 'super';

interface AppContextType {
  role: UserRole;
  setRole: (r: UserRole) => void;
  logout: () => void; // Bổ sung hàm logout chuyên dụng
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

  // 1. Khởi tạo role từ localStorage (giúp giữ role khi reload trang)
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('user_role');
    return (savedRole as UserRole) || 'guest';
  });

  // 2. Viết lại setRole để tự động đồng bộ xuống localStorage
  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole !== 'guest') {
      localStorage.setItem('user_role', newRole);
    }
  }, []);

  // 3. Hàm Đăng xuất: Xóa sạch token & role khỏi bộ nhớ trình duyệt
  const logout = useCallback(() => {
    setRoleState('guest');
    localStorage.removeItem('user_role');
    localStorage.removeItem('access_token');
    
    // Tùy chọn: Đá người dùng về trang login ngay lập tức
    // window.location.href = '/login'; 
  }, []);

  const switchLang = useCallback(() => setLang(lang === 'vi' ? 'en' : 'vi'), [lang, setLang]);

  return (
    <AppContext.Provider value={{ 
      role, 
      setRole, 
      logout, // Export hàm logout ra ngoài
      t, 
      lang, 
      setLang: switchLang as any, 
      theme, 
      toggleTheme 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}