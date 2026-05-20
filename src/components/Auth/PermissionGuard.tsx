import React from 'react';
import { AuthGuard } from '@/integrations/supabase/auth-guard';
import { Permission } from '@/types';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component-level guard to show/hide UI elements based on specific permissions.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  if (AuthGuard.hasPermission(permission)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
