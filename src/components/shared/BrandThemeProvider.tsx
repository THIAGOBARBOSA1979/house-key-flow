import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/services/CompanyService';

export const BrandThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.company_id) {
      const company = companyService.getById(user.company_id, undefined, true);
      if (company?.settings?.primary_color) {
        document.documentElement.style.setProperty('--primary', company.settings.primary_color);
        // Also update hsl version if needed, but for now just raw hex for --primary works if tailwind is configured to use it
        // If tailwind uses HSL, we'd need a converter.
      } else {
        // Reset to default if no company primary color
        document.documentElement.style.removeProperty('--primary');
      }
      
      if (company?.settings?.is_dark_mode_forced) {
        document.documentElement.classList.add('dark');
      } else if (company?.settings?.is_dark_mode_forced === false) {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user]);

  return <>{children}</>;
};
