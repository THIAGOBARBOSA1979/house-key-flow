import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/services';

export const BrandThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    
    if (user?.company_id) {
      companyService.getById(user.company_id, undefined, true).then(company => {
        if (company?.settings?.primary_color) {
          // Update primary color (HSL components needed for some shadcn-ui components)
          // For now we set the raw property
          root.style.setProperty('--primary', company.settings.primary_color);
          root.style.setProperty('--brand', company.settings.primary_color);
        } else {
          root.style.removeProperty('--primary');
          root.style.removeProperty('--brand');
        }
        
        if (company?.settings?.is_dark_mode_forced) {
          root.classList.add('dark');
        } else if (company?.settings?.is_dark_mode_forced === false) {
          root.classList.remove('dark');
        }
      });
    }
  }, [user]);

  return <>{children}</>;
};
