import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export const BrandThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    const root = document.documentElement;
    // Prioritize tenant settings (pre-login) or user company settings (post-login)
    const activeSettings = user?.company_id === tenant?.id ? tenant?.settings : (tenant?.settings || null);
    
    if (activeSettings) {
      if (activeSettings.primary_color) {
        root.style.setProperty('--primary', activeSettings.primary_color);
        root.style.setProperty('--brand', activeSettings.primary_color);
      }
      
      if (activeSettings.is_dark_mode_forced) {
        root.classList.add('dark');
      } else if (activeSettings.is_dark_mode_forced === false) {
        root.classList.remove('dark');
      }
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--brand');
    }
  }, [user, tenant]);

  return <>{children}</>;
};
