import { Role, Permission } from '@/types/auth';

const getInternalSession = () => {
  const stored = localStorage.getItem('sb-ugwfvbctonbnkzxmdydp-auth-token');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.user?.user_metadata || null;
  } catch {
    return null;
  }
};

export const AuthGuard = {
  hasRole(role: Role | Role[]): boolean {
    const session = getInternalSession();
    if (!session) return false;
    
    if (session.is_super_admin) return true;
    
    const roles = Array.isArray(role) ? role : [role];
    const userRole = this.mapInternalRole(session.role);
    
    return roles.includes(userRole);
  },

  hasPermission(permission: Permission): boolean {
    const session = getInternalSession();
    if (!session) return false;
    
    if (session.is_super_admin) return true;
    
    const role = this.mapInternalRole(session.role);
    
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

  isAdmin(): boolean {
    const session = getInternalSession();
    if (!session) return false;
    return session.role === 'admin' || session.role === 'manager' || session.is_super_admin;
  },

  isSuperAdmin(): boolean {
    const session = getInternalSession();
    return !!session?.is_super_admin;
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
