import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supabase } from '@/integrations/supabase';
import { Company } from '@/services/identity/CompanyService';

interface TenantContextType {
  tenant: Company | null;
  isLoading: boolean;
  isCustomDomain: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenant, setTenant] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomDomain, setIsCustomDomain] = useState(false);

  useEffect(() => {
    const resolveTenant = async () => {
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
      
      try {
        let query = Supabase.from('companies').select('*');
        
        // Se for Lovable Preview ou Localhost, podemos usar um tenant de teste ou slug da URL
        // Em prod: empresa.plataforma.com (subdomain) ou custom.domain.com
        const parts = hostname.split('.');
        
        if (parts.length > 2 && !isLocal) {
          // Detectar subdomínio (ex: empresa.sistema.com)
          const subdomain = parts[0];
          query = query.eq('subdomain', subdomain);
        } else {
          // Tentar por custom domain
          query = query.eq('custom_domain', hostname);
          setIsCustomDomain(true);
        }

        const { data, error } = await query.single();
        
        if (data) {
          setTenant(data as unknown as Company);
        }
      } catch (err) {
        console.error('Erro ao resolver tenant:', err);
      } finally {
        setIsLoading(false);
      }
    };

    resolveTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, isCustomDomain }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
