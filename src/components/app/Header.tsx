import { Link } from 'react-router-dom';
import { Sun, Moon, Globe, GraduationCap, Building2, ShieldCheck, LogOut } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { ROLE_IDENTITY } from './roleIdentity';

export function Header() {
  const { role, t, lang, setLang, theme, toggleTheme, logout} = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        
        <Link to={'/'} className="flex items-center gap-3 group">
          <img 
            src={theme === 'dark' ? '/logo-icon-rev.png' : '/logo-icon.png'} 
            alt="Lucidex" 
            className="h-8 w-8 transition-all" 
          />
          <span className="font-display text-xl tracking-tight brand-wordmark">Lucidex</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {role === 'guest' && (
            <>
              <NavBtn icon={<GraduationCap size={16} />} label={t('product') || 'Sản phẩm'} to="/" />
              <NavBtn icon={<Building2 size={16} />} label={t('solutions') || 'Giải pháp'} to="/" />
              <NavBtn icon={<ShieldCheck size={16} />} label={t('verify') || 'Xác thực'} to="/verify" />
            </>
          )}
          {role === 'owner' && <PortalBadge icon={<ROLE_IDENTITY.owner.Icon size={14} />} label={t('ownerPortal') || 'Cổng Sinh viên'} />}
          {role === 'issuer' && <PortalBadge icon={<ROLE_IDENTITY.issuer.Icon size={14} />} label={t('issuerPortal') || 'Cổng Cấp phát'} />}
          {role === 'verifier' && <PortalBadge icon={<ROLE_IDENTITY.verifier.Icon size={14} />} label={t('verifierPortal') || 'Cổng Doanh nghiệp'} />}
          {role === 'admin' && <PortalBadge icon={<ShieldCheck size={14} />} label={t('adminPortal') || 'Quản trị hệ thống'} />}
          {role === 'super' && <PortalBadge icon={<ShieldCheck size={14} />} label={t('superAdminPortal') || 'Quản trị hệ thống cấp cao'} />}
        </nav>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              setLang(lang === 'vi' ? 'en' : 'vi');
            }} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-70"
          >
            <Globe size={14} /> <span className="uppercase text-xs font-semibold">{lang}</span>
          </button>
          
          <button 
            type="button"
            onClick={toggleTheme} 
            className="p-2 rounded-lg hover:opacity-70" 
            title={theme === 'dark' ? t('switchLight') : t('switchDark')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <div className="flex items-center gap-2 ml-2 pl-3 border-l" style={{ borderColor: 'var(--ct-border)' }}>
            {role === 'guest' ? (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5">{t('signIn') || 'Đăng nhập'}</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold rounded-xl shadow-md hover:opacity-90" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>{t('signUp') || 'Đăng ký'}</Link>
              </>
            ) : (
              <>
                {/* NÚT ĐĂNG XUẤT */}
                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 active:scale-95" style={{ borderColor: 'var(--ct-border)' }}>
                  <LogOut size={14} /> <span className="hidden sm:inline">{t('logout') || 'Đăng xuất'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NavBtn({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:opacity-70">
      {icon}{label}
    </Link>
  );
}

function PortalBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="portal-pill flex items-center gap-2 px-4 py-1.5 text-sm font-semibold">
      {icon}{label}
    </div>
  );
}