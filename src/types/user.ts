export type UserRole = 'admin' | 'staff' | 'manager' | 'client';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  propertyId?: string;
  propertyName?: string;
  unit?: string;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  clients: number;
  staff: number;
}
