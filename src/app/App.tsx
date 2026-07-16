import { Outlet } from 'react-router-dom';
import { Header } from '../components/app/Header';

export function AppLayout() {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--ct-bg)', color: 'var(--ct-text)' }}>
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}