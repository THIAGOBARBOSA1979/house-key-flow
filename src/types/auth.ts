import { User } from "./user";

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

