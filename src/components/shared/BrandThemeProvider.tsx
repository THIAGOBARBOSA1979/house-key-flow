import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export const BrandThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    const root = document.documentElement;
    const activeTenant = user?.company_id && tenant?.id === user.company_id ? tenant : tenant;
    const settings = activeTenant?.theme_settings;
    const brandName = activeTenant?.brand_name || activeTenant?.name || 'Sistema de Manutenção';

    // Update Document Title
    document.title = brandName;

    // Update Favicon if exists
    if (activeTenant?.favicon_url) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = activeTenant.favicon_url;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = activeTenant.favicon_url;
        document.head.appendChild(newLink);
      }
    }

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
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--brand');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--radius');
    }
  }, [user, tenant]);

  return <>{children}</>;
};
