import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
}



export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SkeletonLoader type="page" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mapping existing legacy roles to RBAC roles
  const userRole: Role = useMemo(() => {
    if (user.is_super_admin) return 'super_admin';
    if (user.role === 'admin' || user.role === 'manager') return 'admin';
    if (user.role === 'staff') return 'staff';
    if (user.role === 'technical') return 'technical';
    return 'user';
  }, [user]);


  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Super Admin has access to everything
    if (userRole !== 'super_admin' && !roles.includes(userRole)) {
      // If user is client/user but trying to access app/admin
      if (userRole === 'user' && location.pathname.startsWith('/app')) {
        return <Navigate to="/client" replace />;
      }
      // If trying to access super-admin but not super_admin
      if (location.pathname.startsWith('/super-admin') && userRole !== 'super_admin') {
        return <Navigate to="/app" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // Ensure user is not accessing super-admin if they are not super_admin
  if (location.pathname.startsWith('/super-admin') && userRole !== 'super_admin') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
