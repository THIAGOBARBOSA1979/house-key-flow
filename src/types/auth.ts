import { UserRole } from "./user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

