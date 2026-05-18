
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types/auth';
import { User } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { securityService } from '@/services/SystemSecurityService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
    const cleanup = securityService.initialize(() => logout());
    return cleanup;
  }, []);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
            setUser(parsedUser);
          }
        } catch (e) {
          console.error('Falha ao processar dados de autenticação:', e);
          localStorage.removeItem('auth_user');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, role: 'admin' | 'client' = 'admin') => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication logic
      let mockUser: User | null = null;
      
      if (role === 'admin' && email === 'admin@exemplo.com' && password === '123456') {
        mockUser = {
          id: '1',
          name: 'Administrador',
          email: 'admin@exemplo.com',
          role: 'admin',
          status: 'active'
        };
      } else if (role === 'client' && email === 'cliente@exemplo.com' && password === '123456') {
        mockUser = {
          id: 'client-2',
          name: 'João Silva',
          email: 'cliente@exemplo.com',
          role: 'client',
          status: 'active'
        };
      }
      
      if (!mockUser) {
        throw new Error('Credenciais inválidas');
      }
      
      setUser(mockUser);
      
      // Store user data
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      
      if (rememberMe) {
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        localStorage.setItem('rememberMe', 'true');
      }
      
      toast({
        title: "✅ Login realizado com sucesso",
        description: `Bem-vindo, ${mockUser.name}!`,
      });
      
      // Redirect based on role
      const redirectTo = role === 'admin' ? '/admin' : '/client';
      navigate(redirectTo);
      
    } catch (error) {
      toast({
        title: "❌ Erro ao fazer login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberClient');
    localStorage.removeItem('rememberAdmin');
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    
    navigate('/');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
