import { Navigate } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import type { UserRole } from '../../app/AppContext';

export function ProtectedRoute({ allowedRole, children }: { allowedRole: UserRole; children: React.ReactNode }) {
  const { role } = useApp();
  if (role !== allowedRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
}