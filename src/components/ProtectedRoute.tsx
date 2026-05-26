import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { useTenant } from '@/contexts/TenantContext';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
  permission?: string;
}



export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  permission
}) => {
  const { user, isLoading } = useAuth();
  const { tenant, isLoading: isLoadingTenant } = useTenant();
  const { hasPermission, isLoading: loadingPermissions } = usePermission();
  const location = useLocation();

  if (isLoading || loadingPermissions || isLoadingTenant) {
    return <SkeletonLoader type="page" />;
  }

  // Tenant access security check
  if (user && !user.is_super_admin && tenant && user.company_id !== tenant.id) {
    console.error('[Security] Tenant mismatch detected. Access denied.');
    return <Navigate to="/login?error=tenant_mismatch" replace />;
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
      // If user is client/user but trying to access app
      if (userRole === 'user' && location.pathname.startsWith('/app')) {
        return <Navigate to="/client" replace />;
      }
      // If trying to access super-admin
      if (location.pathname.startsWith('/super-admin')) {
        return <Navigate to="/app" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  // Final check for super-admin routes if not caught above
  if (location.pathname.startsWith('/super-admin') && userRole !== 'super_admin') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
