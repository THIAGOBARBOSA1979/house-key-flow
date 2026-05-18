export type Role = 'super_admin' | 'admin' | 'user';

export type Permission = 
  | 'system:manage' 
  | 'company:manage' 
  | 'company:view_all'
  | 'users:manage_all'
  | 'users:manage_own'
  | 'billing:manage'
  | 'audit:view'
  | 'operational:read'
  | 'operational:write'
  | 'operational:delete';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'system:manage',
    'company:manage',
    'company:view_all',
    'users:manage_all',
    'billing:manage',
    'audit:view',
    'operational:read',
    'operational:write',
    'operational:delete'
  ],
  admin: [
    'users:manage_own',
    'operational:read',
    'operational:write',
    'operational:delete'
  ],
  user: [
    'operational:read'
  ]
};

export interface UserContext {
  id: string;
  email: string;
  role: Role;
  company_id?: string;
  permissions: Permission[];
}
