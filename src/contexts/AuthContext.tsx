
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
import { errorHandler } from '@/utils/errors/ErrorHandler';
import { ErrorCode } from '@/utils/errors/AppError';



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

  useEffect(() => {
    if (user) {
      AuthGuard.initialize();
    }
  }, [user]);

  const isAuthenticated = !!user;

  const logout = useCallback(async () => {
    try {
      await Supabase.auth.signOut();
      setUser(null);
      
      // Cleanup sensitive local storage
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberClient');
      localStorage.removeItem('rememberAdmin');
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      navigate('/');
    } catch (error) {
      errorHandler.handle(error, 'AuthContext:logout');
    }
  }, [navigate, toast]);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Source of truth: Supabase session
      const { data: { session }, error } = await Supabase.auth.getSession();
      
      if (error) throw error;

      if (session?.user) {
        const authenticatedUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          role: (session.user.user_metadata?.role as any) || 'client',
          status: 'active',
          company_id: session.user.user_metadata?.company_id,
          is_super_admin: session.user.user_metadata?.role === 'super_admin'
        };
        setUser(authenticatedUser);
      } else {
        setUser(null);
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
    
    // Listen for auth changes
    const { data: { subscription } } = Supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const authenticatedUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as any) || 'client',
            status: 'active',
            company_id: session.user.user_metadata?.company_id,
            is_super_admin: session.user.user_metadata?.role === 'super_admin'
          };
          
          setUser(authenticatedUser);
        }
      }
    });

    const cleanup = securityService.initialize(() => logout());
    
    return () => {
      subscription.unsubscribe();
      cleanup();
    };
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
        // 2. Fallback to Mocks for demo/dev (ONLY if in dev mode)
        if (import.meta.env.DEV && (password === '123456' || password === 'admin123')) {
          const mockEmail = email === 'admin@a2incorporadora.com.br' ? 'admin@exemplo.com' : email;
          const mock = findMockUser(mockEmail, role);
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


      
      // Persistence is handled by Supabase auth storage (localStorage by default)
      setUser(authenticatedUser);
      
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
      errorHandler.handle(error, 'AuthContext:login');
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
