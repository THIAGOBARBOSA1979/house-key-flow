
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types/auth';
import { User } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { securityService } from '@/services';
import { companyService } from '@/services';
import { AuthGuard } from '@/integrations/supabase/auth-guard';
import { Supabase } from '@/integrations/supabase';
import { findMockUser } from '@/mocks/users';


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

  useEffect(() => {
    if (user) {
      AuthGuard.initialize();
    }
  }, [user]);

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
      // 1. Try Supabase Login first
      const { data, error } = await Supabase.auth.signInWithPassword(email, password);
      
      let authenticatedUser: User | null = null;

      if (!error && data?.user) {
        // Map Supabase user to our internal User type
        authenticatedUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email || '',
          role: (data.user.user_metadata?.role as any) || 'client',
          status: 'active',
          company_id: data.user.user_metadata?.company_id,
          is_super_admin: data.user.user_metadata?.role === 'super_admin'
        };
      } else {
        // 2. Fallback to Mocks for demo/dev (if password is '123456')
        if (password === '123456') {
          const mock = findMockUser(email, role);
          if (mock) authenticatedUser = mock;
        }
      }

      if (!authenticatedUser) {
        throw new Error(error?.message || 'Credenciais inválidas');
      }

      // Check company status if user belongs to one
      if (authenticatedUser.company_id && !authenticatedUser.is_super_admin) {
        const company = await companyService.getById(authenticatedUser.company_id, undefined, true);
        if (company) {
          if (company.status !== 'active') {
            throw new Error(`Empresa ${company.status === 'suspended' ? 'suspensa' : 'cancelada'}. Entre em contato com o suporte.`);
          }
          if (company.subscription_expires_at && new Date(company.subscription_expires_at) < new Date()) {
            throw new Error('Assinatura expirada. Por favor, renove seu plano.');
          }
        }
      }


      
      setUser(authenticatedUser);
      
      // Store user data
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (rememberMe) {
        localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
      }
      
      toast({
        title: "✅ Login realizado com sucesso",
        description: `Bem-vindo, ${authenticatedUser.name}!`,
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
