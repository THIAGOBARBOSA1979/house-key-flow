import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SkeletonLoader } from './shared/SkeletonLoader';
import { Role } from '@/integration/supabase/auth-types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SkeletonLoader type="page" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get role from user metadata (Supabase Auth)
  const userRole = (user.user_metadata?.role as Role) || 'user';

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Super Admin has access to everything
    if (userRole !== 'super_admin' && !roles.includes(userRole)) {
      // If user is client/user but trying to access admin
      if (userRole === 'user' && location.pathname.startsWith('/admin')) {
        return <Navigate to="/client" replace />;
      }
      // If admin trying to access saas admin but not super_admin
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
