
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types/auth';
import { User } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { securityService } from '@/services/SystemSecurityService';
import { companyService } from '@/services/CompanyService';


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

  const logout = useCallback(() => {
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
  }, [navigate, toast]);

  const checkAuth = useCallback(() => {
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
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
    const cleanup = securityService.initialize(() => logout());
    return cleanup;
  }, [checkAuth, logout]);

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
          name: 'Super Admin',
          email: 'admin@exemplo.com',
          role: 'admin',
          status: 'active',
          is_super_admin: true
        };
      } else if (role === 'admin' && email === 'ceo@a2.com' && password === '123456') {
        mockUser = {
          id: 'ceo-1',
          name: 'João CEO',
          email: 'ceo@a2.com',
          role: 'admin',
          status: 'active',
          company_id: 'comp-1'
        };
      } else if (role === 'client' && email === 'cliente@exemplo.com' && password === '123456') {
        mockUser = {
          id: 'client-2',
          name: 'Maria Silva',
          email: 'cliente@exemplo.com',
          role: 'client',
          status: 'active',
          company_id: 'comp-1'
        };
      }

      
      if (!mockUser) {
        throw new Error('Credenciais inválidas');
      }

      // Check company status if user belongs to one
      if (mockUser.company_id) {
        const company = companyService.getById(mockUser.company_id);
        if (company) {
          if (company.status !== 'active') {
            throw new Error(`Empresa ${company.status === 'suspended' ? 'suspensa' : 'cancelada'}. Entre em contato com o suporte.`);
          }
          if (company.subscription_expires_at && new Date(company.subscription_expires_at) < new Date()) {
            throw new Error('Assinatura expirada. Por favor, renove seu plano.');
          }
        }
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
      if (window.location.pathname !== redirectTo) {
        navigate(redirectTo);
      }
      
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
