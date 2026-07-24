import { Outlet } from 'react-router-dom';
import { Header } from '../components/app/Header';
import { useApp } from '../app/AppContext';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';

export function AppLayout() {
  const { t } = useApp();
  
  useAxiosInterceptor(t);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--ct-bg)', color: 'var(--ct-text)' }}>
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}