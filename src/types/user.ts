export type UserRole = 'admin' | 'staff' | 'manager' | 'client' | 'technical';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  notes?: string;
  propertyId?: string;
  propertyName?: string;
  unit?: string;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface UserFiltersData {
  search: string;
  role: string;
  status: string;
  property: string;
  unit: string;
}

export interface UserFormData extends Omit<User, 'id' | 'createdAt' | 'lastLogin'> {
  propertyId?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  clients: number;
  staff: number;
}


