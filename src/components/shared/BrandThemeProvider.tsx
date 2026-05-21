import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companyService } from '@/services';

export const BrandThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.company_id) {
      companyService.getById(user.company_id, undefined, true).then(company => {
        if (company?.settings?.primary_color) {
          document.documentElement.style.setProperty('--primary', company.settings.primary_color);
        } else {
          document.documentElement.style.removeProperty('--primary');
        }
        
        if (company?.settings?.is_dark_mode_forced) {
          document.documentElement.classList.add('dark');
        } else if (company?.settings?.is_dark_mode_forced === false) {
          document.documentElement.classList.remove('dark');
        }
      });
    }
  }, [user]);

  return <>{children}</>;
};
