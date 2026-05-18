import { Role, Permission, ROLE_PERMISSIONS, UserContext } from './auth-types';
import { Supabase } from './index';

export class AuthGuard {
  private static currentUserContext: UserContext | null = null;

  static async initialize(): Promise<UserContext | null> {
    const user = await Supabase.auth.getCurrentUser();
    if (!user) {
      this.currentUserContext = null;
      return null;
    }

    const role = (user.user_metadata?.role as Role) || 'user';
    const company_id = user.user_metadata?.company_id;

    this.currentUserContext = {
      id: user.id,
      email: user.email || '',
      role,
      company_id,
      permissions: ROLE_PERMISSIONS[role] || []
    };

    return this.currentUserContext;
  }

  static hasPermission(permission: Permission): boolean {
    if (!this.currentUserContext) return false;
    return this.currentUserContext.permissions.includes(permission);
  }

  static hasRole(role: Role | Role[]): boolean {
    if (!this.currentUserContext) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(this.currentUserContext.role);
  }

  static getContext(): UserContext | null {
    return this.currentUserContext;
  }

  static isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }

  static isAdmin(): boolean {
    return this.hasRole(['admin', 'super_admin']);
  }

  static getPermissions(): Permission[] {
    return this.currentUserContext?.permissions || [];
  }

  static getRole(): Role | null {
    return this.currentUserContext?.role || null;
  }


  static canAccessTenant(targetCompanyId: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this.currentUserContext?.company_id === targetCompanyId;
  }
}
