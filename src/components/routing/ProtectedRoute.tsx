import { Navigate, Outlet } from 'react-router-dom';
import { RouteGuard } from '@/components/RouteGuard';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  requiredRoles: UserRole[];
  isAuthenticated: boolean;
}

export function ProtectedRoute({ requiredRoles, isAuthenticated }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <RouteGuard requiredRoles={requiredRoles}>
      <Outlet />
    </RouteGuard>
  );
}
