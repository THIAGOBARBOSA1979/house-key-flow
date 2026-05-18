import { Supabase } from './index';

export type Role = 'super_admin' | 'admin' | 'manager' | 'staff' | 'technical' | 'user';

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_properties'
  | 'manage_inspections'
  | 'manage_warranty'
  | 'view_reports'
  | 'system_settings';

export const AuthGuard = {
  // Simple check for now, can be expanded with real Supabase RBAC
  hasRole(role: Role | Role[]): boolean {
    const userJson = localStorage.getItem('auth_user');
    if (!userJson) return false;
    const user = JSON.parse(userJson);
    
    if (user.is_super_admin) return true;
    
    const roles = Array.isArray(role) ? role : [role];
    const userRole = this.mapInternalRole(user.role);
    
    return roles.includes(userRole);
  },

  hasPermission(permission: Permission): boolean {
    const userJson = localStorage.getItem('auth_user');
    if (!userJson) return false;
    const user = JSON.parse(userJson);
    
    if (user.is_super_admin) return true;
    
    // Simple permission mapping
    const role = this.mapInternalRole(user.role);
    
    const rolePermissions: Record<Role, Permission[]> = {
      super_admin: ['view_dashboard', 'manage_users', 'manage_properties', 'manage_inspections', 'manage_warranty', 'view_reports', 'system_settings'],
      admin: ['view_dashboard', 'manage_users', 'manage_properties', 'manage_inspections', 'manage_warranty', 'view_reports'],
      manager: ['view_dashboard', 'manage_properties', 'manage_inspections', 'manage_warranty'],
      staff: ['view_dashboard', 'manage_inspections', 'manage_warranty'],
      technical: ['manage_inspections'],
      user: ['view_dashboard']
    };
    
    return rolePermissions[role]?.includes(permission) || false;
  },

  mapInternalRole(internalRole: string): Role {
    if (internalRole === 'admin') return 'admin';
    if (internalRole === 'manager') return 'manager';
    if (internalRole === 'staff') return 'staff';
    if (internalRole === 'technical') return 'technical';
    return 'user';
  },

  initialize() {
    console.log('[AuthGuard] Protocolo de segurança inicializado.');
  }
};
