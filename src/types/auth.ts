import { User } from "./user";

export type Role = 'super_admin' | 'admin' | 'manager' | 'staff' | 'technical' | 'user';

export type PlanFeature = 
  | 'manage_properties'
  | 'manage_inspections'
  | 'manage_warranty'
  | 'advanced_reports'
  | 'custom_branding'
  | 'unlimited_users'
  | 'api_access'
  | 'priority_support';

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'manage_properties'
  | 'manage_inspections'
  | 'manage_warranty'
  | 'view_reports'
  | 'system_settings';


export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: User['role']) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}
