import { useState, useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useI18n } from './hooks/useI18n';
import { Sun, Moon, Globe, GraduationCap, Building2, ShieldCheck, Users, LogOut } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { OwnerPortal } from './pages/OwnerPortal';
import { IssuerPortal } from './pages/IssuerPortal';
import { VerifierPortal } from './pages/VerifierPortal';
import { AdminPortal } from './pages/AdminPortal';
import { VerifyLinkPage } from './pages/VerifyLinkPage';
import { Login } from './pages/LoginPage';
import { Register } from './pages/RegisterPage';

export type UserRole = 'guest' | 'owner' | 'issuer' | 'verifier' | 'admin';
export type Page = 'landing' | 'owner' | 'issuer' | 'verifier' | 'admin' | 'verify' | 'login' | 'register';

export interface AppContextType {
  page: Page;
  setPage: (p: Page) => void;
  role: UserRole;
  setRole: (r: UserRole) => void;
  t: (key: string) => string;
  lang: 'vi' | 'en';
  setLang: (l: 'vi' | 'en') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [page, setPage] = useState<Page>('landing');
  const [role, setRole] = useState<UserRole>('guest');

  const switchLang = useCallback(() => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  }, [lang, setLang]);

  const renderPage = () => {
    const ctx = { page, setPage, role, setRole, t, lang, setLang, theme, toggleTheme };
    
    switch (page) {
      case 'landing': return <LandingPage ctx={ctx} />;
      case 'login': return <Login ctx={ctx} />;
      case 'register': return <Register ctx={ctx} />;
      case 'verify': return <VerifyLinkPage ctx={ctx} />;
      // Protected Routes: Kiểm tra quyền trước khi render Portal, nếu sai quyền ép về Login
      case 'owner': return role === 'owner' ? <OwnerPortal ctx={ctx} /> : <Login ctx={ctx} />;
      case 'issuer': return role === 'issuer' ? <IssuerPortal ctx={ctx} /> : <Login ctx={ctx} />;
      case 'verifier': return role === 'verifier' ? <VerifierPortal ctx={ctx} /> : <Login ctx={ctx} />;
      case 'admin': return role === 'admin' ? <AdminPortal ctx={ctx} /> : <Login ctx={ctx} />;
      default: return <LandingPage ctx={ctx} />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--ct-bg)', color: 'var(--ct-text)' }}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => { setPage('landing'); setRole('guest'); }} className="flex items-center gap-3 group">
            <img src="/logo-icon.png" alt="Lucidex" className="h-8 w-8" />
            <span className="font-display text-xl tracking-tight" style={{ color: 'var(--ct-text)' }}>Lucidex</span>
          </button>

          {/* Center Nav - Context aware */}
          <nav className="hidden md:flex items-center gap-1">
            {role === 'guest' && (
              <>
                <NavBtn icon={<GraduationCap size={16} />} label={t('product') || 'Sản phẩm'} onClick={() => setPage('landing')} />
                <NavBtn icon={<Building2 size={16} />} label={t('solutions') || 'Giải pháp'} onClick={() => setPage('landing')} />
                <NavBtn icon={<ShieldCheck size={16} />} label={t('verify') || 'Xác thực'} onClick={() => setPage('verify')} />
              </>
            )}
            {role === 'owner' && <PortalBadge icon={<GraduationCap size={14} />} label={t('OwnerPortal') || 'Cổng Sinh viên'} />}
            {role === 'issuer' && <PortalBadge icon={<Building2 size={14} />} label={t('issuerPortal') || 'Cổng Cấp phát'} />}
            {role === 'verifier' && <PortalBadge icon={<Users size={14} />} label={t('verifierPortal') || 'Cổng Doanh nghiệp'} />}
            {role === 'admin' && <PortalBadge icon={<ShieldCheck size={14} />} label={t('adminPortal') || 'Quản trị hệ thống'} />}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button onClick={switchLang} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-70" style={{ color: 'var(--ct-text-secondary)' }}>
              <Globe size={14} />
              <span className="uppercase text-xs font-semibold">{lang}</span>
            </button>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--ct-text-secondary)' }} title={theme === 'dark' ? t('switchLight') : t('switchDark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Authencation Actions (Login / Logout) */}
            <div className="flex items-center gap-1.5 ml-2 pl-3 border-l" style={{ borderColor: 'var(--ct-border)' }}>
              {role === 'guest' ? (
                <>
                  <button 
                    onClick={() => setPage('login')} 
                    className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95" 
                    style={{ color: 'var(--ct-text)' }}
                  >
                    {t('Sign In') || 'Đăng nhập'}
                  </button>
                  <button 
                    onClick={() => setPage('register')} 
                    className="px-4 py-2 text-sm font-semibold rounded-xl shadow-md transition-all hover:opacity-90 active:scale-95" 
                    style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}
                  >
                    {t('Sign Up') || 'Đăng ký'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { setRole('guest'); setPage('landing'); }} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border shadow-sm transition-all hover:opacity-70 active:scale-95" 
                  style={{ borderColor: 'var(--ct-border)', color: 'var(--ct-text)', background: 'var(--ct-surface)' }}
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">{t('logout') || 'Đăng xuất'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {renderPage()}
      </main>
    </div>
  );
}

function NavBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--ct-text-secondary)' }}>
      {icon}
      {label}
    </button>
  );
}

function PortalBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full" style={{ background: 'var(--ct-accent-blue)', color: 'var(--ct-text)' }}>
      {icon}
      {label}
    </div>
  );
}

export default App;