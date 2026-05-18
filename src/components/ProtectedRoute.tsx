import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole = 'admin',
  redirectTo 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to unified login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo || '/login'} state={{ from: location }} replace />;
  }

  // Authenticated but wrong role
  if (user && user.role !== requiredRole) {
    // Basic role check
    if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'manager' && user.role !== 'staff') {
       return <Navigate to="/client" replace />;
    }
    if (requiredRole === 'client' && user.role !== 'client') {
       return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

