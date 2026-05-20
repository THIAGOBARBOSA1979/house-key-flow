import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SkeletonLoader } from '@/components/Shared/SkeletonLoader';
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
  let userRole: Role = 'user';
  if (user.is_super_admin) {
    userRole = 'super_admin';
  } else if (user.role === 'admin' || user.role === 'manager') {
    userRole = 'admin';
  } else if (user.role === 'staff') {
    userRole = 'staff';
  } else if (user.role === 'technical') {
    userRole = 'technical';
  } else {
    userRole = 'user';
  }


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
