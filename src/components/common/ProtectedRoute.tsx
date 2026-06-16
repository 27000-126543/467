import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user) {
    const roleHierarchy = ['principal', 'municipal', 'provincial', 'national'];
    const userLevel = roleHierarchy.indexOf(user.role);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);
    if (userLevel < requiredLevel) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
