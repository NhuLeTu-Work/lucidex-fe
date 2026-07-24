import { Outlet } from 'react-router-dom';
import { Header } from '../components/app/Header';
import { useApp } from '../app/AppContext';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';
import { Toast } from '@/components/ui/toast';

export function AppLayout() {
  const { t, toastConfig, hideToast } = useApp();
  
  useAxiosInterceptor(t);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--ct-bg)', color: 'var(--ct-text)' }}>
      <Header />
      <Toast 
        isOpen={toastConfig.isOpen} 
        type={toastConfig.type} 
        message={toastConfig.message} 
        onClose={hideToast} 
        t={t} 
      />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}