import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
        let query = supabase.from('companies').select('*');
        
        const parts = hostname.split('.');
        
        if (parts.length > 2 && !isLocal) {
          const subdomain = parts[0];
          query = query.eq('subdomain', subdomain);
        } else if (!isLocal) {
          query = query.eq('custom_domain', hostname);
          setIsCustomDomain(true);
        } else {
          // No localhost, se não houver subdomínio, podemos pegar a primeira empresa para testes
          const { data: firstCompany } = await supabase.from('companies').select('*').limit(1).single();
          if (firstCompany) {
            setTenant(firstCompany as unknown as Company);
            setIsLoading(false);
            return;
          }
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
