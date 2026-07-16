import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Globe, GraduationCap, Building2, ShieldCheck, Users, LogOut } from 'lucide-react';
import { useApp } from '../../app/AppContext';

export function Header() {
  const { role, setRole, t, lang, setLang, theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'var(--ct-surface)', borderColor: 'var(--ct-border)' }}>
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" onClick={() => setRole('guest')} className="flex items-center gap-3 group">
          <img src="/logo-icon.png" alt="Lucidex" className="h-8 w-8" />
          <span className="font-display text-xl tracking-tight">Lucidex</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {role === 'guest' && (
            <>
              <NavBtn icon={<GraduationCap size={16} />} label={t('product') || 'Sản phẩm'} to="/" />
              <NavBtn icon={<Building2 size={16} />} label={t('solutions') || 'Giải pháp'} to="/" />
              <NavBtn icon={<ShieldCheck size={16} />} label={t('verify') || 'Xác thực'} to="/verify" />
            </>
          )}
          {role === 'owner' && <PortalBadge icon={<GraduationCap size={14} />} label={t('OwnerPortal') || 'Cổng Sinh viên'} />}
          {role === 'issuer' && <PortalBadge icon={<Building2 size={14} />} label={t('issuerPortal') || 'Cổng Cấp phát'} />}
          {role === 'verifier' && <PortalBadge icon={<Users size={14} />} label={t('verifierPortal') || 'Cổng Doanh nghiệp'} />}
          {role === 'admin' && <PortalBadge icon={<ShieldCheck size={14} />} label={t('adminPortal') || 'Quản trị hệ thống'} />}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-70">
            <Globe size={14} /> <span className="uppercase text-xs font-semibold">{lang}</span>
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:opacity-70" title={theme === 'dark' ? t('switchLight') : t('switchDark')}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l" style={{ borderColor: 'var(--ct-border)' }}>
            {role === 'guest' ? (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5">{t('Sign In') || 'Đăng nhập'}</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold rounded-xl shadow-md hover:opacity-90" style={{ background: 'var(--ct-text)', color: 'var(--ct-bg)' }}>{t('Sign Up') || 'Đăng ký'}</Link>
              </>
            ) : (
              <button onClick={() => { setRole('guest'); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border" style={{ borderColor: 'var(--ct-border)' }}>
                <LogOut size={14} /> <span className="hidden sm:inline">{t('logout') || 'Đăng xuất'}</span>
              </button>
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
    <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full" style={{ background: 'var(--ct-accent-blue)', color: 'var(--ct-text)' }}>
      {icon}{label}
    </div>
  );
}