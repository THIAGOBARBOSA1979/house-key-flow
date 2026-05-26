import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/services/identity/CompanyService';

interface TenantContextType {
  tenant: Company | null;
  isLoading: boolean;
  isCustomDomain: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenant, setTenant] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveTenant = async () => {
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.lovableproject.com');
      
      try {
        let query = supabase.from('companies').select('*');
        
        // Se estiver num subdomínio (ex: empresa.sistema.com)
        const parts = hostname.split('.');
        
        // Lógica para detectar subdomínio ignorando domínios de desenvolvimento do Lovable
        const isLovablePreview = hostname.includes('.lovableproject.com');
        
        if (parts.length > 2 && !isLovablePreview) {
          const subdomain = parts[0];
          query = query.eq('subdomain', subdomain);
        } else if (!isLocal && !isLovablePreview) {
          // Domínio customizado (ex: suporte.cliente.com.br)
          query = query.eq('custom_domain', hostname);
          setIsCustomDomain(true);
        } else {
          // Fallback para localhost ou preview do Lovable: tenta pegar via query param 'tenant' para debug
          const urlParams = new URLSearchParams(window.location.search);
          const tenantSlug = urlParams.get('tenant');
          
          if (tenantSlug) {
            query = query.eq('slug', tenantSlug);
          } else {
            // Se não houver nada, pega a primeira empresa para não quebrar o layout
            const { data: firstCompany } = await supabase.from('companies').select('*').limit(1).maybeSingle();
            if (firstCompany) {
              setTenant(firstCompany as unknown as Company);
              setIsLoading(false);
              return;
            }
          }
        }

        const { data, error } = await query.maybeSingle();
        
        if (data) {
          setTenant(data as unknown as Company);
          
          // Apply White Label Dynamic Settings
          const root = document.documentElement;
          const settings = (data as any).theme_settings;
          if (settings) {
            if (settings.primary) {
              root.style.setProperty('--primary', settings.primary);
              root.style.setProperty('--brand', settings.primary);
            }
            if (settings.secondary) {
              root.style.setProperty('--secondary', settings.secondary);
            }
            if (settings.radius) {
              root.style.setProperty('--radius', settings.radius);
            }
          }
        } else if (!isLocal && !isLovablePreview) {
           // Se estamos em um domínio/subdomínio e não achou a empresa, é 404 de tenant
           console.warn('Tenant não encontrado para o host:', hostname);
           setError('Tenant não encontrado');
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
    <TenantContext.Provider value={{ tenant, isLoading, isCustomDomain, error }}>
      {isLoading ? null : children}
    </TenantContext.Provider>
  );
};


export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within a TenantProvider');
  return context;
};
